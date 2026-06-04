package nlu.fit.backend.repository;

import nlu.fit.backend.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    Optional<Subscription> findByUserId(UUID userId);

    @Query("SELECT s.creditBalance FROM Subscription s WHERE s.user.id = :userId")
    Optional<Integer> findCreditBalanceByUserId(@Param("userId") UUID userId);
}
