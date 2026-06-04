package nlu.fit.backend.repository;

import nlu.fit.backend.entity.CvAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CvAnalysisRepository extends JpaRepository<CvAnalysis, UUID> {
    Optional<CvAnalysis> findByCvId(UUID cvId);
}
