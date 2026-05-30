package nlu.fit.backend.service;

public interface EmailService {
    void sendVerificationEmail(String email, String fullName);
}
