package nlu.fit.backend.repository;

import nlu.fit.backend.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    boolean existsByTxnRef(String txnRef);
}
