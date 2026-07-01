package nlu.fit.backend.security.oauth2;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.entity.LinkedAccount;
import nlu.fit.backend.entity.User;
import nlu.fit.backend.entity.enums.AuthProvider;
import nlu.fit.backend.entity.enums.Role;
import nlu.fit.backend.exception.AccountLinkingRequiredException;
import nlu.fit.backend.exception.OAuth2AuthenticationProcessingException;
import nlu.fit.backend.repository.LinkedAccountRepository;
import nlu.fit.backend.repository.UserRepository;
import nlu.fit.backend.security.UserPrincipal;
import nlu.fit.backend.service.SubscriptionService;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final LinkedAccountRepository linkedAccountRepository;
    private final SubscriptionService subscriptionService;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest oAuth2UserRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(oAuth2UserRequest);

        try {
            return processOAuth2User(oAuth2UserRequest, oAuth2User);
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            throw new OAuth2AuthenticationProcessingException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = OAuth2UserInfoFactory.getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        if (!StringUtils.hasText(oAuth2UserInfo.getEmail())) {
            throw new OAuth2AuthenticationProcessingException("Email not found from OAuth2 provider");
        }

        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());
        Optional<LinkedAccount> linkedAccountOpt = linkedAccountRepository.findByProviderAndProviderId(
                provider, oAuth2UserInfo.getId());

        User user;
        if (linkedAccountOpt.isPresent()) {
            // Already linked - just load the user
            user = linkedAccountOpt.get().getUser();
            if (!user.isEnabled()) {
                throw new OAuth2AuthenticationProcessingException("User account is disabled.");
            }
            // Proactively update avatar/fullname if they changed
            updateExistingUser(user, oAuth2UserInfo);
        } else {
            // Check if email already exists in DB
            Optional<User> userOpt = userRepository.findByEmail(oAuth2UserInfo.getEmail());
            if (userOpt.isPresent()) {
                // Email collision! Require password-based account linking
                log.info("Email collision detected for {}. Requiring manual account linking.", oAuth2UserInfo.getEmail());
                throw new AccountLinkingRequiredException(
                        "An account with this email already exists. Please confirm to link your account.",
                        provider.name(),
                        oAuth2UserInfo.getId(),
                        oAuth2UserInfo.getEmail(),
                        oAuth2UserInfo.getName(),
                        oAuth2UserInfo.getAvatarUrl()
                );
            } else {
                // Register as a new user with this social account
                user = registerNewUser(oAuth2UserRequest, oAuth2UserInfo);
            }
        }

        return new UserPrincipal(user, oAuth2User.getAttributes());
    }

    private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2UserInfo oAuth2UserInfo) {
        String registrationId = oAuth2UserRequest.getClientRegistration().getRegistrationId();
        AuthProvider provider = AuthProvider.valueOf(registrationId.toUpperCase());

        User user = User.builder()
                .email(oAuth2UserInfo.getEmail())
                .fullName(oAuth2UserInfo.getName())
                .avatarUrl(oAuth2UserInfo.getAvatarUrl())
                .role(Role.USER)
                .emailVerified(true) // Social sign-ins are pre-verified
                .enabled(true)
                .build();

        user = userRepository.save(user);

        try {
            subscriptionService.initSubscription(user);
            log.info("Initialized subscription for OAuth2 user: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to initialize subscription for user: {}", user.getEmail(), e);
            throw new OAuth2AuthenticationProcessingException("Could not setup user subscription profile");
        }

        LinkedAccount linkedAccount = LinkedAccount.builder()
                .user(user)
                .provider(provider)
                .providerId(oAuth2UserInfo.getId())
                .providerEmail(oAuth2UserInfo.getEmail())
                .providerName(oAuth2UserInfo.getName())
                .build();

        linkedAccountRepository.save(linkedAccount);
        log.info("Created new user via OAuth2: {}", user.getEmail());
        return user;
    }

    private void updateExistingUser(User user, OAuth2UserInfo oAuth2UserInfo) {
        boolean updated = false;
        if (user.getAvatarUrl() == null && oAuth2UserInfo.getAvatarUrl() != null) {
            user.setAvatarUrl(oAuth2UserInfo.getAvatarUrl());
            updated = true;
        }
        if (user.getFullName() != null && !user.getFullName().equals(oAuth2UserInfo.getName())) {
            user.setFullName(oAuth2UserInfo.getName());
            updated = true;
        }
        if (updated) {
            userRepository.save(user);
        }
    }
}
