package nlu.fit.backend.exception;

import lombok.Getter;
import org.springframework.security.core.AuthenticationException;

@Getter
public class AccountLinkingRequiredException extends AuthenticationException {
    private final String provider;
    private final String providerId;
    private final String email;
    private final String fullName;
    private final String avatarUrl;

    public AccountLinkingRequiredException(
            String message, 
            String provider, 
            String providerId, 
            String email, 
            String fullName, 
            String avatarUrl
    ) {
        super(message);
        this.provider = provider;
        this.providerId = providerId;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
    }
}
