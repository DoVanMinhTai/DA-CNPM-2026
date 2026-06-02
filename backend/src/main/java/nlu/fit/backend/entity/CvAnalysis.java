package nlu.fit.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cv_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private Cv cv;

    @Column(nullable = false)
    private Short score;

    @Column(nullable = false, columnDefinition = "jsonb")
    private String strengths = "[]";

    @Column(nullable = false, columnDefinition = "jsonb")
    private String improvements = "[]";

    @Column(name = "keyword_suggestions", nullable = false, columnDefinition = "jsonb")
    private String keywordSuggestions = "[]";

    @Column(name = "target_role", length = 255)
    private String targetRole;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}