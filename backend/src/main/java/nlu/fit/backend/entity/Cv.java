package nlu.fit.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import nlu.fit.backend.entity.enums.CvStatus;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cvs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cv {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CvStatus status = CvStatus.DRAFT;

    @Column(name = "ats_score")
    private Short atsScore;

    @Column(name = "original_file_url", length = 512)
    private String originalFileUrl;

    // Lưu ý: Hibernate 6 tự động map String sang JSONB trên PostgreSQL
    @Column(nullable = false, columnDefinition = "jsonb")
    private String content = "{}";

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private OffsetDateTime updatedAt;
}