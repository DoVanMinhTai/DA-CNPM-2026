package nlu.fit.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import nlu.fit.backend.entity.enums.PlanType;
import nlu.fit.backend.entity.enums.SubscriptionStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "subscriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private PlanType plan = PlanType.STARTER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;

    @Column(name = "credit_balance", nullable = false)
    private Integer creditBalance = 10;

    @Column(name = "next_billing_date")
    private OffsetDateTime nextBillingDate;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}