package nlu.fit.backend.repository;

import nlu.fit.backend.entity.Cv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CvRepository extends JpaRepository<Cv, UUID> {
    List<Cv> findByUserIdOrderByUpdatedAtDesc(UUID userId);
    long countByUserId(UUID userId);
    long countByUserIdAndCreatedAtAfter(UUID userId, java.time.OffsetDateTime from);
}
