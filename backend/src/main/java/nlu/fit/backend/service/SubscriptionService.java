package nlu.fit.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.entity.Subscription;
import nlu.fit.backend.entity.User;
import nlu.fit.backend.entity.enums.PlanType;
import nlu.fit.backend.entity.enums.SubscriptionStatus;
import nlu.fit.backend.exception.InsufficientCreditsException;
import nlu.fit.backend.exception.SubscriptionNotFoundException;
import nlu.fit.backend.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;

    /**
     * Initialize subscription for new user during registration.
     * Creates a STARTER plan with 10 free credits.
     * 
     * @param user the newly registered user
     */
    @Transactional
    public void initSubscription(User user) {
        log.info("Initializing subscription for user: {}", user.getId());
        
        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(PlanType.STARTER)
                .status(SubscriptionStatus.ACTIVE)
                .creditBalance(10)
                .nextBillingDate(null)
                .build();
        
        subscriptionRepository.save(subscription);
        log.info("Subscription initialized successfully for user: {}", user.getId());
    }

    /**
     * Validate and consume credits for AI features.
     * Throws exception if subscription is expired or insufficient credits.
     * 
     * @param userId the user ID
     * @param amount the amount of credits to consume
     * @throws SubscriptionNotFoundException if subscription not found
     * @throws InsufficientCreditsException if expired or insufficient balance
     */
    @Transactional
    public void validateAndConsumeCredit(UUID userId, int amount) {
        log.info("Validating and consuming {} credits for user: {}", amount, userId);
        
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Subscription not found for user: " + userId));

        
        // Check if subscription is expired
        if (subscription.getStatus() == SubscriptionStatus.EXPIRED) {
            log.warn("Subscription expired for user: {}", userId);
            throw new InsufficientCreditsException("Gói đăng ký của bạn đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng.");
        }
        
        // Check if sufficient credits
        if (subscription.getCreditBalance() < amount) {
            log.warn("Insufficient credits for user: {}. Required: {}, Available: {}", 
                    userId, amount, subscription.getCreditBalance());
            throw new InsufficientCreditsException(
                String.format("Số dư credit không đủ. Bạn cần %d credits nhưng chỉ có %d credits.", 
                        amount, subscription.getCreditBalance())
            );
        }
        
        // Deduct credits
        subscription.setCreditBalance(subscription.getCreditBalance() - amount);
        subscriptionRepository.save(subscription);
        
        log.info("Successfully consumed {} credits for user: {}. Remaining: {}", 
                amount, userId, subscription.getCreditBalance());
    }

    /**
     * Cancel user subscription.
     * Sets status to CANCELLED but keeps plan and billing date intact.
     * 
     * @param userId the user ID
     * @throws SubscriptionNotFoundException if subscription not found
     */
    @Transactional
    public void cancelSubscription(UUID userId) {
        log.info("Cancelling subscription for user: {}", userId);
        
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Subscription not found for user: " + userId));
        
        subscription.setStatus(SubscriptionStatus.CANCELLED);
        subscriptionRepository.save(subscription);
        
        log.info("Subscription cancelled successfully for user: {}. Plan {} retained until: {}", 
                userId, subscription.getPlan(), subscription.getNextBillingDate());
    }

    /**
     * Upgrade user subscription plan.
     * Internal method called by VNPayService after successful payment.
     * 
     * @param userId the user ID
     * @param newPlan the new plan type
     * @param credits the credits to set for the new plan
     * @param billingDays the number of days until next billing
     */
    @Transactional
    public void upgradeSubscription(UUID userId, PlanType newPlan, int credits, int billingDays) {
        log.info("Upgrading subscription for user: {} to plan: {}", userId, newPlan);
        
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Subscription not found for user: " + userId));
        
        subscription.setPlan(newPlan);
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscription.setCreditBalance(credits);
        subscription.setNextBillingDate(OffsetDateTime.now().plusDays(billingDays));
        
        subscriptionRepository.save(subscription);
        log.info("Subscription upgraded successfully for user: {}", userId);
    }

    /**
     * Add credits to user subscription (top-up).
     * Internal method called by VNPayService after successful payment.
     * 
     * @param userId the user ID
     * @param creditsToAdd the amount of credits to add
     */
    @Transactional
    public void addCredits(UUID userId, int creditsToAdd) {
        log.info("Adding {} credits to user: {}", creditsToAdd, userId);
        
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Subscription not found for user: " + userId));
        
        subscription.setCreditBalance(subscription.getCreditBalance() + creditsToAdd);
        subscriptionRepository.save(subscription);
        
        log.info("Credits added successfully. User: {}, New balance: {}", 
                userId, subscription.getCreditBalance());
    }

    /**
     * Reactivate a cancelled subscription.
     * Sets status back to ACTIVE if it was CANCELLED.
     * 
     * @param userId the user ID
     * @throws SubscriptionNotFoundException if subscription not found
     * @throws IllegalStateException if the subscription status is not CANCELLED
     */
    @Transactional
    public void reactivateSubscription(UUID userId) {
        log.info("Reactivating subscription for user: {}", userId);
        
        Subscription subscription = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Subscription not found for user: " + userId));
        
        if (subscription.getStatus() != SubscriptionStatus.CANCELLED) {
            log.warn("Cannot reactivate subscription for user: {} because status is {}", userId, subscription.getStatus());
            throw new IllegalStateException("Chỉ có thể kích hoạt lại gói đăng ký đã bị hủy.");
        }
        
        subscription.setStatus(SubscriptionStatus.ACTIVE);
        subscriptionRepository.save(subscription);
        
        log.info("Subscription reactivated successfully for user: {}. Plan: {}", userId, subscription.getPlan());
    }

    /**
     * Get user subscription details.
     * 
     * @param userId the user ID
     * @return the subscription entity
     */
    public Subscription getSubscription(UUID userId) {
        return subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new SubscriptionNotFoundException("Subscription not found for user: " + userId));
    }
}
