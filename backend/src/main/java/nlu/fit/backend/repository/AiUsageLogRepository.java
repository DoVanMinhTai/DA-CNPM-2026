package nlu.fit.backend.repository;

import nlu.fit.backend.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.UUID;

@Repository
public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, UUID> {
    
    @Query("SELECT COALESCE(SUM(a.creditsUsed), 0) FROM AiUsageLog a WHERE a.user.id = :userId AND a.createdAt >= :from")
    Integer sumCreditsUsedByUserIdSince(@Param("userId") UUID userId, @Param("from") OffsetDateTime from);
}
