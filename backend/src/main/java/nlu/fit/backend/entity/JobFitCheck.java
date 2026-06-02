package nlu.fit.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "job_fit_checks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobFitCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private Cv cv;

    @Column(name = "job_description", nullable = false, columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "fit_score")
    private Short fitScore;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String analysis = "{}";

    @Column(name = "credits_used", nullable = false)
    private Short creditsUsed = 1;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}