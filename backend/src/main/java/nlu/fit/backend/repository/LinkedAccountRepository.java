package nlu.fit.backend.repository;

import nlu.fit.backend.entity.LinkedAccount;
import nlu.fit.backend.entity.User;
import nlu.fit.backend.entity.enums.AuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LinkedAccountRepository extends JpaRepository<LinkedAccount, UUID> {
    Optional<LinkedAccount> findByProviderAndProviderId(AuthProvider provider, String providerId);
    List<LinkedAccount> findByUser(User user);
}
