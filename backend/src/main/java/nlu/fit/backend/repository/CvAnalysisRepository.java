package nlu.fit.backend.repository;

import nlu.fit.backend.entity.CvAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CvAnalysisRepository extends JpaRepository<CvAnalysis, UUID> {
    Optional<CvAnalysis> findByCvId(UUID cvId);
    long countByCvUserId(UUID userId);
    long countByCvUserIdAndCreatedAtAfter(UUID userId, java.time.OffsetDateTime from);
    @org.springframework.data.jpa.repository.Query("SELECT AVG(c.score) FROM CvAnalysis c WHERE c.cv.user.id = :userId")
    java.util.Optional<Double> findAverageScoreByUserId(@org.springframework.data.repository.query.Param("userId") UUID userId);
    @org.springframework.data.jpa.repository.Query("SELECT AVG(c.score) FROM CvAnalysis c WHERE c.cv.user.id = :userId AND c.createdAt >= :from")
    java.util.Optional<Double> findAverageScoreByUserIdSince(@org.springframework.data.repository.query.Param("userId") UUID userId, @org.springframework.data.repository.query.Param("from") java.time.OffsetDateTime from);
}
