package nlu.fit.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.mapper.UserMapper;
import nlu.fit.backend.dto.request.ConfirmLinkRequest;
import nlu.fit.backend.dto.request.LoginRequest;
import nlu.fit.backend.dto.request.RegisterRequest;
import nlu.fit.backend.dto.response.AuthResponse;
import nlu.fit.backend.dto.response.MessageResponse;
import nlu.fit.backend.entity.LinkedAccount;
import nlu.fit.backend.entity.User;
import nlu.fit.backend.entity.enums.AuthProvider;
import nlu.fit.backend.entity.enums.Role;
import nlu.fit.backend.exception.EmailAlreadyExistsException;
import nlu.fit.backend.exception.EmailNotVerifiedException;
import nlu.fit.backend.exception.InvalidCredentialsException;
import nlu.fit.backend.exception.InvalidTokenException;
import nlu.fit.backend.exception.UserNotFoundException;
import nlu.fit.backend.repository.LinkedAccountRepository;
import nlu.fit.backend.repository.UserRepository;
import nlu.fit.backend.security.jwt.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final LinkedAccountRepository linkedAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final EmailService emailService;
    private final UserMapper userMapper;

    @Override
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email is already registered by another account");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .emailVerified(false)
                .enabled(true)
                .build();

        userRepository.save(user);
        log.info("Registered user successfully: {}", user.getEmail());

        // Dispatch verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName());

        return MessageResponse.builder()
                .message("Registration successful. Please check your email to verify your account.")
                .build();
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Your email is not verified yet. Please check your inbox.");
        }

        if (!user.isEnabled()) {
            throw new InvalidCredentialsException("Your account is disabled.");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user.getId());

        log.info("User logged in successfully: {}", user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toUserResponse(user))
                .build();
    }

    @Override
    @Transactional
    public AuthResponse refresh(String refreshToken) {
        UUID userId = refreshTokenService.validateRefreshToken(refreshToken);
        String newRefreshToken = refreshTokenService.rotateRefreshToken(refreshToken);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!user.isEnabled()) {
            throw new InvalidTokenException("User is disabled.");
        }

        String newAccessToken = jwtTokenProvider.generateAccessToken(user);

        log.info("Rotated access & refresh tokens for user ID: {}", userId);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(userMapper.toUserResponse(user))
                .build();
    }

    @Override
    public void logout(String refreshToken) {
        refreshTokenService.revokeRefreshToken(refreshToken);
        log.info("Logged out user and revoked refresh token successfully.");
    }

    @Override
    @Transactional
    public void verifyEmail(String token) {
        if (!jwtTokenProvider.validateToken(token)) {
            throw new InvalidTokenException("Email verification token is invalid or has expired.");
        }

        String email = jwtTokenProvider.getEmailFromToken(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        if (user.isEmailVerified()) {
            log.info("User email already verified: {}", email);
            return;
        }

        user.setEmailVerified(true);
        userRepository.save(user);
        log.info("Email verified successfully for user: {}", email);
    }

    @Override
    @Transactional(readOnly = true)
    public MessageResponse resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + email));

        if (user.isEmailVerified()) {
            return MessageResponse.builder()
                    .message("This email is already verified.")
                    .build();
        }

        emailService.sendVerificationEmail(user.getEmail(), user.getFullName());

        return MessageResponse.builder()
                .message("Verification email resent successfully. Please check your inbox.")
                .build();
    }

    @Override
    @Transactional
    public AuthResponse confirmAccountLink(ConfirmLinkRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found with email: " + request.getEmail()));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid password. Verification failed.");
        }

        // Verify if linked account already exists
        AuthProvider provider = AuthProvider.valueOf(request.getProvider().toUpperCase());
        Optional<LinkedAccount> existingLink = linkedAccountRepository.findByProviderAndProviderId(
                provider, request.getProviderId());

        if (existingLink.isPresent()) {
            throw new EmailAlreadyExistsException("This social account is already linked to a user.");
        }

        // Create and save new LinkedAccount
        LinkedAccount linkedAccount = LinkedAccount.builder()
                .user(user)
                .provider(provider)
                .providerId(request.getProviderId())
                .providerEmail(request.getProviderEmail())
                .providerName(request.getProviderName())
                .build();

        linkedAccountRepository.save(linkedAccount);

        // Update avatar if user doesn't have one and OAuth profile does
        if (user.getAvatarUrl() == null && request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty()) {
            user.setAvatarUrl(request.getAvatarUrl());
            userRepository.save(user);
        }

        log.info("Linked social account ({}) to existing local user: {}", provider, user.getEmail());

        String accessToken = jwtTokenProvider.generateAccessToken(user);
        String refreshToken = refreshTokenService.createRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userMapper.toUserResponse(user))
                .build();
    }
}
