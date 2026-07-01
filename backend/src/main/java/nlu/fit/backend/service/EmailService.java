package nlu.fit.backend.service;

public interface EmailService {
    void sendVerificationEmail(String email, String fullName);
    void sendPasswordResetEmail(String email, String fullName, String resetUrl);
}
