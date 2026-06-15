package nlu.fit.backend.controller;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.entity.Subscription;
import nlu.fit.backend.entity.User;
import nlu.fit.backend.repository.UserRepository;
import nlu.fit.backend.service.SubscriptionService;
import nlu.fit.backend.service.VNPayService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final VNPayService vnPayService;
    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    /**
     * Create VNPay payment URL for subscription upgrade or credit purchase.
     * 
     * @param packageType the package type (PROFESSIONAL, ENTERPRISE, CREDIT_50, etc.)
     * @param request the HTTP servlet request
     * @param userDetails the authenticated user details
     * @return payment URL wrapped in response map
     */
    @PostMapping("/create-payment-url")
    public ResponseEntity<Map<String, String>> createPaymentUrl(
            @RequestParam("packageType") String packageType,
            HttpServletRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            log.info("Creating payment URL for user: {}, package: {}", user.getId(), packageType);
            String paymentUrl = vnPayService.createVnPayUrl(user.getId(), packageType, request);
            
            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "paymentUrl", paymentUrl
            ));
        } catch (Exception e) {
            log.error("Error creating payment URL", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", "false",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Handle VNPay return callback (user redirected back from VNPay).
     * Verifies signature and redirects to frontend with result.
     * 
     * @param request the HTTP servlet request containing VNPay parameters
     * @return redirect response to frontend
     */
    @GetMapping("/vnpay-return")
    public ResponseEntity<?> handleVNPayReturn(HttpServletRequest request) {
        log.info("Handling VNPay return callback");
        boolean valid = vnPayService.verifySignature(request);
        if (!valid) {
            log.error("Invalid VNPay signature on return");
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create(buildFrontendRedirect("fail", "Invalid signature")))
                    .build();
        }

        // Extract all VNPay params and attempt to process immediately (idempotent)
        Map<String, String> params = extractVnpayParams(request);

        String status;
        String message;
        try {
            vnPayService.processVnPayIPN(params);
            status = "success";
            message = "Payment successful";
        } catch (Exception e) {
            log.error("Error processing VNPay return", e);
            status = "fail";
            message = e.getMessage() != null ? e.getMessage() : "Payment processing failed";
        }

        String redirectUrl = buildFrontendRedirect(status, message);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl))
                .build();
    }

    /**
     * Handle VNPay IPN (Instant Payment Notification) callback.
     * This is called by VNPay server directly to confirm payment.
     * 
     * @param request the HTTP servlet request containing VNPay parameters
     * @return JSON response for VNPay server
     */
    @PostMapping("/vnpay-ipn")
    public ResponseEntity<Map<String, String>> handleVNPayIPN(HttpServletRequest request) {
        log.info("Handling VNPay IPN callback");
        
        try {
            Map<String, String> vnpayParams = extractVnpayParams(request);
            vnPayService.processVnPayIPN(vnpayParams);
            
            return ResponseEntity.ok(Map.of(
                    "RspCode", "00",
                    "Message", "Success"
            ));
        } catch (Exception e) {
            log.error("Error processing VNPay IPN", e);
            return ResponseEntity.ok(Map.of(
                    "RspCode", "99",
                    "Message", "Error: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<Map<String, String>> confirmPayment(HttpServletRequest request) {
        log.info("Confirm payment called from frontend");
        try {
            Map<String, String> params = extractVnpayParams(request);
            vnPayService.processVnPayIPN(params);
            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "message", "Payment confirmed"
            ));
        } catch (Exception e) {
            log.error("Error confirming payment", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", "false",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Cancel user subscription.
     * 
     * @param userDetails the authenticated user details
     * @return success response
     */
    @PostMapping("/cancel-subscription")
    public ResponseEntity<Map<String, String>> cancelSubscription(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            log.info("Cancelling subscription for user: {}", user.getId());
            
            subscriptionService.cancelSubscription(user.getId());
            
            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "message", "Subscription cancelled successfully"
            ));
        } catch (Exception e) {
            log.error("Error cancelling subscription", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", "false",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Get current subscription details for authenticated user.
     * 
     * @param userDetails the authenticated user details
     * @return subscription details
     */
    @GetMapping("/subscription")
    public ResponseEntity<?> getSubscription(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            Subscription subscription = subscriptionService.getSubscription(user.getId());
            
            return ResponseEntity.ok(Map.of(
                    "plan", subscription.getPlan().name(),
                    "status", subscription.getStatus().name(),
                    "creditBalance", subscription.getCreditBalance(),
                    "nextBillingDate", subscription.getNextBillingDate() != null 
                            ? subscription.getNextBillingDate().toString() 
                            : null
            ));
        } catch (Exception e) {
            log.error("Error fetching subscription", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", "false",
                    "message", e.getMessage()
            ));
        }
    }

    // ========== HELPER METHODS ==========

    private Map<String, String> extractVnpayParams(HttpServletRequest request) {
        Map<String, String> params = new java.util.TreeMap<>();
        for (java.util.Enumeration<String> paramNames = request.getParameterNames(); paramNames.hasMoreElements();) {
            String paramName = paramNames.nextElement();
            String paramValue = request.getParameter(paramName);
            if (paramValue != null && !paramValue.isEmpty()) {
                params.put(paramName, paramValue);
            }
        }
        return params;
    }

    private String buildFrontendRedirect(String status, String message) {
        try {
            String encodedMessage = java.net.URLEncoder.encode(message, "UTF-8");
            return String.format("http://localhost:5173/payment/result?status=%s&message=%s", status, encodedMessage);
        } catch (Exception e) {
            return "http://localhost:5173/payment/result?status=fail&message=Error";
        }
    }
}
