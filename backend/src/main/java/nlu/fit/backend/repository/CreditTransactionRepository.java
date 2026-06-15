package nlu.fit.backend.repository;

import nlu.fit.backend.entity.CreditTransaction;
import nlu.fit.backend.entity.enums.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.UUID;

@Repository
public interface CreditTransactionRepository extends JpaRepository<CreditTransaction, UUID> {

    @Query("SELECT COALESCE(SUM(c.amount), 0) FROM CreditTransaction c WHERE c.user.id = :userId AND c.type = :type AND c.createdAt >= :from")
    Integer sumAmountByUserIdAndTypeSince(@Param("userId") UUID userId, @Param("type") TransactionType type, @Param("from") OffsetDateTime from);

}
