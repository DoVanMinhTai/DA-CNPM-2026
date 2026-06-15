package nlu.fit.backend.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "payment_transaction")
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "txn_ref", unique = true, nullable = false)
    private String txnRef;

    @Column(name = "processed_at", nullable = false)
    private OffsetDateTime processedAt;

    public PaymentTransaction() {}

    public PaymentTransaction(String txnRef, OffsetDateTime processedAt) {
        this.txnRef = txnRef;
        this.processedAt = processedAt;
    }

    public Long getId() {
        return id;
    }

    public String getTxnRef() {
        return txnRef;
    }

    public void setTxnRef(String txnRef) {
        this.txnRef = txnRef;
    }

    public OffsetDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(OffsetDateTime processedAt) {
        this.processedAt = processedAt;
    }
}
