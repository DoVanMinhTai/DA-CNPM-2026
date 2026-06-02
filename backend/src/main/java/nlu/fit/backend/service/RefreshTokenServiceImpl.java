package nlu.fit.backend.service;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.exception.InvalidTokenException;
import nlu.fit.backend.security.jwt.JwtProperties;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.io.Serializable;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final JwtProperties jwtProperties;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RefreshTokenInfo implements Serializable {
        private String token;
        private UUID userId;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;
    }

    private String buildRedisKey(UUID userId, String tokenId) {
        return "rt:" + userId.toString() + ":" + tokenId;
    }

    /**
     * Create a new refresh token, store in Redis with TTL from configuration.
     * The token string returned to client is Base64(userId + ":" + tokenId)
     */
    @Override
    public String createRefreshToken(UUID userId) {
        String tokenId = UUID.randomUUID().toString();
        String publicToken = encodeToken(userId, tokenId);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(jwtProperties.getRefreshTokenExpiration());

        RefreshTokenInfo tokenInfo = RefreshTokenInfo.builder()
                .token(publicToken)
                .userId(userId)
                .createdAt(now)
                .expiresAt(expiresAt)
                .build();

        String redisKey = buildRedisKey(userId, tokenId);
        redisTemplate.opsForValue().set(
                redisKey,
                tokenInfo,
                jwtProperties.getRefreshTokenExpiration(),
                TimeUnit.MILLISECONDS
        );

        return publicToken;
    }

    /**
     * Decode public token, lookup in Redis, and return userId.
     */
    @Override
    public UUID validateRefreshToken(String publicToken) {
        try {
            DecodedToken decoded = decodeToken(publicToken);
            String redisKey = buildRedisKey(decoded.userId, decoded.tokenId);
            
            RefreshTokenInfo tokenInfo = (RefreshTokenInfo) redisTemplate.opsForValue().get(redisKey);
            if (tokenInfo == null) {
                throw new InvalidTokenException("Refresh token is invalid or has expired");
            }
            return tokenInfo.getUserId();
        } catch (Exception ex) {
            log.error("Refresh token validation failed", ex);
            throw new InvalidTokenException("Refresh token is invalid or has expired");
        }
    }

    /**
     * Rotate token: validate, delete old, create new.
     */
    @Override
    public String rotateRefreshToken(String oldPublicToken) {
        DecodedToken decoded = decodeToken(oldPublicToken);
        String redisKey = buildRedisKey(decoded.userId, decoded.tokenId);

        RefreshTokenInfo tokenInfo = (RefreshTokenInfo) redisTemplate.opsForValue().get(redisKey);
        if (tokenInfo == null) {
            // Token does not exist - possible theft attempt. Revoke all user tokens!
            log.warn("Attempted reuse of refresh token by user: {}. Revoking all user tokens.", decoded.userId);
            revokeAllUserTokens(decoded.userId);
            throw new InvalidTokenException("Refresh token has been reused or is invalid. All sessions revoked.");
        }

        // Delete old token
        redisTemplate.delete(redisKey);

        // Create new token
        return createRefreshToken(decoded.userId);
    }

    /**
     * Revoke specific token.
     */
    @Override
    public void revokeRefreshToken(String publicToken) {
        try {
            DecodedToken decoded = decodeToken(publicToken);
            String redisKey = buildRedisKey(decoded.userId, decoded.tokenId);
            redisTemplate.delete(redisKey);
        } catch (Exception ex) {
            log.error("Failed to revoke refresh token", ex);
        }
    }

    /**
     * Revoke all tokens for a specific user.
     */
    @Override
    public void revokeAllUserTokens(UUID userId) {
        String pattern = "rt:" + userId.toString() + ":*";
        Set<String> keys = redisTemplate.keys(pattern);
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
            log.info("Revoked {} tokens for user: {}", keys.size(), userId);
        }
    }

    // Helper methods for encoding/decoding token string
    private String encodeToken(UUID userId, String tokenId) {
        String combined = userId.toString() + ":" + tokenId;
        return Base64.getUrlEncoder().withoutPadding().encodeToString(combined.getBytes(StandardCharsets.UTF_8));
    }

    private DecodedToken decodeToken(String publicToken) {
        try {
            byte[] decodedBytes = Base64.getUrlDecoder().decode(publicToken);
            String combined = new String(decodedBytes, StandardCharsets.UTF_8);
            String[] parts = combined.split(":");
            if (parts.length != 2) {
                throw new InvalidTokenException("Invalid token format");
            }
            return new DecodedToken(UUID.fromString(parts[0]), parts[1]);
        } catch (Exception ex) {
            throw new InvalidTokenException("Invalid token format");
        }
    }

    @AllArgsConstructor
    private static class DecodedToken {
        private final UUID userId;
        private final String tokenId;
    }
}
