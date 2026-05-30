package nlu.fit.backend.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.exception.AccountLinkingRequiredException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    private final HttpCookieOAuth2AuthorizationRequestRepository authorizationRequestRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request, 
            HttpServletResponse response, 
            AuthenticationException exception
    ) throws IOException, ServletException {
        
        log.warn("OAuth2 authentication failure: {}", exception.getMessage());
        
        String targetUrl;
        
        if (exception instanceof AccountLinkingRequiredException linkingEx) {
            // Email collision detected - redirect to linking flow on frontend
            targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                    .queryParam("linking", "true")
                    .queryParam("provider", linkingEx.getProvider())
                    .queryParam("providerId", linkingEx.getProviderId())
                    .queryParam("email", linkingEx.getEmail())
                    .queryParam("fullName", URLEncoder.encode(linkingEx.getFullName(), StandardCharsets.UTF_8))
                    .queryParam("avatarUrl", linkingEx.getAvatarUrl() != null ? URLEncoder.encode(linkingEx.getAvatarUrl(), StandardCharsets.UTF_8) : "")
                    .build().toUriString();
        } else {
            // General failure - redirect to callback with error message
            targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth2/callback")
                    .queryParam("error", URLEncoder.encode(exception.getMessage(), StandardCharsets.UTF_8))
                    .build().toUriString();
        }

        // Clear OAuth2 authorization cookies
        authorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
