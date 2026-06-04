package nlu.fit.backend.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.response.BillingInfoResponse;
import nlu.fit.backend.entity.Subscription;
import nlu.fit.backend.entity.enums.PlanType;
import nlu.fit.backend.entity.enums.SubscriptionStatus;
import nlu.fit.backend.service.SubscriptionService;
import nlu.fit.backend.entity.User;
import nlu.fit.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*", allowCredentials = "true", maxAge = 3600)
public class BillingController {

    private final SubscriptionService subscriptionService;
    private final UserRepository userRepository;

    /**
     * Get current subscription and billing information for authenticated user.
     * 
     * @param userDetails the authenticated user details
     * @return billing details DTO
     */
    @GetMapping("/info")
    public ResponseEntity<?> getBillingInfo(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            log.info("Fetching billing info for user: {}", user.getId());
            
            Subscription sub = subscriptionService.getSubscription(user.getId());
            
            // Calculate helper fields for frontend UI handling
            boolean isProOrEnterprise = sub.getPlan() == PlanType.PROFESSIONAL || sub.getPlan() == PlanType.ENTERPRISE;
            boolean isCancelable = isProOrEnterprise && sub.getStatus() == SubscriptionStatus.ACTIVE;
            boolean isReactivatable = sub.getStatus() == SubscriptionStatus.CANCELLED;
            
            BillingInfoResponse billingInfo = BillingInfoResponse.builder()
                    .plan(sub.getPlan().name())
                    .status(sub.getStatus().name())
                    .creditBalance(sub.getCreditBalance())
                    .nextBillingDate(sub.getNextBillingDate())
                    .isCancelable(isCancelable)
                    .isReactivatable(isReactivatable)
                    .build();
            
            return ResponseEntity.ok(billingInfo);
        } catch (Exception e) {
            log.error("Error fetching billing info", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", "false",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * Cancel the user's active subscription.
     * 
     * @param userDetails the authenticated user details
     * @return success response
     */
    @PostMapping("/cancel")
    public ResponseEntity<?> cancelSubscription(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            log.info("Request to cancel subscription from user: {}", user.getId());
            
            subscriptionService.cancelSubscription(user.getId());
            
            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "message", "Gói đăng ký của bạn đã được hủy thành công. Bạn vẫn có thể sử dụng các quyền lợi của gói cho đến ngày hết hạn."
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
     * Reactivate a previously cancelled subscription.
     * 
     * @param userDetails the authenticated user details
     * @return success response
     */
    @PostMapping("/reactivate")
    public ResponseEntity<?> reactivateSubscription(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            log.info("Request to reactivate subscription from user: {}", user.getId());
            
            subscriptionService.reactivateSubscription(user.getId());
            
            return ResponseEntity.ok(Map.of(
                    "success", "true",
                    "message", "Gói đăng ký của bạn đã được kích hoạt lại thành công."
            ));
        } catch (Exception e) {
            log.error("Error reactivating subscription", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", "false",
                    "message", e.getMessage()
            ));
        }
    }
}
