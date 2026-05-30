package nlu.fit.backend.service;

import java.util.UUID;

public interface RefreshTokenService {
    String createRefreshToken(UUID userId);
    UUID validateRefreshToken(String publicToken);
    String rotateRefreshToken(String oldPublicToken);
    void revokeRefreshToken(String publicToken);
    void revokeAllUserTokens(UUID userId);
}
