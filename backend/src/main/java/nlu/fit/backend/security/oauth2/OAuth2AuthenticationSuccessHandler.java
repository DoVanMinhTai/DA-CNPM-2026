package nlu.fit.backend.security.oauth2;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.security.UserPrincipal;
import nlu.fit.backend.service.RefreshTokenService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final RefreshTokenService refreshTokenService;
    private final HttpCookieOAuth2AuthorizationRequestRepository authorizationRequestRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request, 
            HttpServletResponse response, 
            Authentication authentication
    ) throws IOException, ServletException {
        
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        log.info("OAuth2 login successful for user: {}", principal.getName());

        // Create refresh token
        String refreshToken = refreshTokenService.createRefreshToken(principal.getUser().getId());

        // Set refresh token cookie with SameSite=Lax (crucial for cross-site redirect from Google/FB)
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false) // Set to true in production (HTTPS)
                .sameSite("Lax") // Lax required for initial OAuth redirect
                .path("/api/auth")
                .maxAge(Duration.ofDays(7))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        // Clear OAuth2 cookies
        authorizationRequestRepository.removeAuthorizationRequestCookies(request, response);

        // Redirect browser to frontend success callback page
        String targetUrl = frontendUrl + "/oauth2/callback?success=true";
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
