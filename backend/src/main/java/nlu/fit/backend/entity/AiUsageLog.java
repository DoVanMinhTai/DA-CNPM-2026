package nlu.fit.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import nlu.fit.backend.entity.enums.AiAction;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_usage_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id") // Trường này được phép NULL theo SQL 'ON DELETE SET NULL'
    private Cv cv;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private AiAction action;

    @Column(name = "credits_used", nullable = false)
    private Short creditsUsed = 1;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}