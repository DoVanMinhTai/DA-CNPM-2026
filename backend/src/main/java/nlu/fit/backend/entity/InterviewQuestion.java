package nlu.fit.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private Cv cv;

    /**
     * Job description text used for question generation context.
     * Nullable — if not provided, questions are generated from CV alone.
     */
    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    /**
     * Detected or configured difficulty level: "junior", "mid", "senior"
     */
    @Column(name = "difficulty", length = 20)
    private String difficulty;

    /**
     * Target job title extracted/inferred during generation
     */
    @Column(name = "target_job_title", length = 255)
    private String targetJobTitle;

    /**
     * JSONB array of generated questions with full structure
     * (category, question, context, idealAnswer, difficulty, rubric)
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    private String questions = "[]";

    /**
     * Status: "generated", "in_progress", "completed", "cancelled"
     */
    @Column(length = 20, nullable = false)
    @Builder.Default
    private String status = "generated";

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
