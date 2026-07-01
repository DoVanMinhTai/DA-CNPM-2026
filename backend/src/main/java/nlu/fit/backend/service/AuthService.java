package nlu.fit.backend.service;

import nlu.fit.backend.dto.request.LoginRequest;
import nlu.fit.backend.dto.request.RegisterRequest;
import nlu.fit.backend.dto.response.AuthResponse;
import nlu.fit.backend.dto.response.MessageResponse;

public interface AuthService {
    MessageResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refresh(String refreshToken);
    void logout(String refreshToken);
    void verifyEmail(String token);
    MessageResponse resendVerificationEmail(String email);
    MessageResponse forgotPassword(String email);
    MessageResponse resetPassword(String token, String newPassword);
}
