package nlu.fit.backend.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.entity.enums.PlanType;
import nlu.fit.backend.exception.PaymentException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPayService {

    private final SubscriptionService subscriptionService;

    @Value("${vnpay.url}")
    private String vnpayUrl;

    @Value("${vnpay.tmn-code}")
    private String vnpayTmnCode;

    @Value("${vnpay.hash-secret}")
    private String vnpayHashSecret;

    @Value("${vnpay.return-url}")
    private String vnpayReturnUrl;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    // Package pricing configuration
    private static final Map<String, PackageInfo> PACKAGE_PRICING = Map.of(
            "PROFESSIONAL", new PackageInfo(500000L, PlanType.PROFESSIONAL, 500, 30),
            "ENTERPRISE", new PackageInfo(2000000L, PlanType.ENTERPRISE, 3000, 30),
            "CREDIT_50", new PackageInfo(50000L, null, 50, 0),
            "CREDIT_100", new PackageInfo(100000L, null, 100, 0),
            "CREDIT_500", new PackageInfo(450000L, null, 500, 0)
    );

    private static class PackageInfo {
        final long priceVND;
        final PlanType planType; // null for credit top-up
        final int credits;
        final int billingDays;

        PackageInfo(long priceVND, PlanType planType, int credits, int billingDays) {
            this.priceVND = priceVND;
            this.planType = planType;
            this.credits = credits;
            this.billingDays = billingDays;
        }
    }

    /**
     * Create VNPay payment URL for subscription upgrade or credit purchase.
     * 
     * @param userId the user ID
     * @param packageType the package type (e.g., "PROFESSIONAL", "CREDIT_50")
     * @param request the HTTP servlet request
     * @return the VNPay payment URL
     * @throws PaymentException if package type is invalid
     */
    public String createVnPayUrl(UUID userId, String packageType, HttpServletRequest request) {
        log.info("Creating VNPay URL for user: {}, package: {}", userId, packageType);

        PackageInfo packageInfo = PACKAGE_PRICING.get(packageType);
        if (packageInfo == null) {
            throw new PaymentException("Invalid package type: " + packageType);
        }

        // Generate unique transaction reference
        String vnpTxnRef = generateTxnRef();
        long amount = packageInfo.priceVND * 100; // VNPay expects amount in smallest unit (VND * 100)

        // Build VNPay parameters
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnpayTmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", vnpTxnRef);
        vnpParams.put("vnp_OrderInfo", buildOrderInfo(userId, packageType));
        vnpParams.put("vnp_OrderType", "billpayment");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnpayReturnUrl);
        vnpParams.put("vnp_IpAddr", getClientIp(request));
        vnpParams.put("vnp_CreateDate", getCurrentDateTime());

        // Generate secure hash
        String queryUrl = buildQuery(vnpParams);
        String secureHash = hmacSHA512(vnpayHashSecret, queryUrl);
        vnpParams.put("vnp_SecureHash", secureHash);

        // Build final payment URL
        String paymentUrl = vnpayUrl + "?" + buildQuery(vnpParams);
        log.info("VNPay URL created successfully. TxnRef: {}", vnpTxnRef);

        return paymentUrl;
    }

    /**
     * Process VNPay IPN (Instant Payment Notification) callback.
     * Validates payment and updates user subscription accordingly.
     * 
     * @param vnpayParams the parameters from VNPay callback
     * @throws PaymentException if signature is invalid or payment failed
     */
    @Transactional
    public void processVnPayIPN(Map<String, String> vnpayParams) {
        log.info("Processing VNPay IPN callback");

        // 1. Verify signature
        String receivedHash = vnpayParams.get("vnp_SecureHash");
        vnpayParams.remove("vnp_SecureHash");
        vnpayParams.remove("vnp_SecureHashType");

        String queryUrl = buildQuery(new TreeMap<>(vnpayParams));
        String calculatedHash = hmacSHA512(vnpayHashSecret, queryUrl);

        if (!calculatedHash.equals(receivedHash)) {
            log.error("Invalid VNPay signature");
            throw new PaymentException("Invalid payment signature");
        }

        // 2. Check response code
        String responseCode = vnpayParams.get("vnp_ResponseCode");
        if (!"00".equals(responseCode)) {
            log.warn("Payment failed with response code: {}", responseCode);
            throw new PaymentException("Payment failed with code: " + responseCode);
        }

        // 3. Parse order info to extract userId and packageType
        String orderInfo = vnpayParams.get("vnp_OrderInfo");
        String[] parts = orderInfo.split("\\|");
        UUID userId = UUID.fromString(parts[0]);
        String packageType = parts[1];

        log.info("Payment successful for user: {}, package: {}", userId, packageType);

        // 4. Update subscription based on package type
        PackageInfo packageInfo = PACKAGE_PRICING.get(packageType);
        if (packageInfo == null) {
            throw new PaymentException("Invalid package type in order: " + packageType);
        }

        if (packageInfo.planType != null) {
            // Upgrade plan (PRO/ENTERPRISE)
            subscriptionService.upgradeSubscription(
                    userId, 
                    packageInfo.planType, 
                    packageInfo.credits, 
                    packageInfo.billingDays
            );
            log.info("Subscription upgraded to {} for user: {}", packageInfo.planType, userId);
        } else {
            // Buy credits (top-up)
            subscriptionService.addCredits(userId, packageInfo.credits);
            log.info("Added {} credits to user: {}", packageInfo.credits, userId);
        }
    }

    /**
     * Verify VNPay return signature from browser redirect.
     * 
     * @param request the HTTP servlet request containing VNPay parameters
     * @return true if signature is valid, false otherwise
     */
    public boolean verifySignature(HttpServletRequest request) {
        Map<String, String> fields = new TreeMap<>();
        for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty() && !fieldName.equals("vnp_SecureHash")) {
                fields.put(fieldName, fieldValue);
            }
        }

        String receivedHash = request.getParameter("vnp_SecureHash");
        String queryUrl = buildQuery(fields);
        String calculatedHash = hmacSHA512(vnpayHashSecret, queryUrl);

        return calculatedHash.equals(receivedHash);
    }

    /**
     * Parse order info from VNPay return URL.
     * 
     * @param orderInfo the order info string (format: "userId|packageType")
     * @return map containing userId and packageType
     */
    public Map<String, String> parseOrderInfo(String orderInfo) {
        String[] parts = orderInfo.split("\\|");
        return Map.of(
                "userId", parts[0],
                "packageType", parts[1]
        );
    }

    // ========== HELPER METHODS ==========

    private String generateTxnRef() {
        return "TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String buildOrderInfo(UUID userId, String packageType) {
        return userId.toString() + "|" + packageType;
    }

    private String getCurrentDateTime() {
        return LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private String buildQuery(Map<String, String> params) {
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (query.length() > 0) {
                query.append("&");
            }
            try {
                query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8.toString()))
                        .append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString()));
            } catch (UnsupportedEncodingException e) {
                log.error("Encoding error", e);
            }
        }
        return query.toString();
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] hashBytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hash = new StringBuilder();
            for (byte b : hashBytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception e) {
            log.error("Error generating HMAC SHA512", e);
            throw new PaymentException("Error generating payment signature");
        }
    }
}
