package nlu.fit.backend.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.security.jwt.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.backend-url}")
    private String backendUrl;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Override
    public void sendVerificationEmail(String email, String fullName) {
        String token = jwtTokenProvider.generateEmailVerificationToken(email);
        String verificationUrl = backendUrl + "/api/auth/verify-email?token=" + token;

        log.info("Generating verification email for {} with token. URL: {}", email, verificationUrl);

        if (mailUsername == null || mailUsername.trim().isEmpty()) {
            log.warn("=== EMAIL SMTP IS NOT CONFIGUERD ===");
            log.warn("To verify email for user '{}' ({}), open this URL in your browser:", fullName, email);
            log.warn("URL: {}", verificationUrl);
            log.warn("====================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, 
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, 
                    StandardCharsets.UTF_8.name()
            );

            helper.setTo(email);
            helper.setSubject("CareerAI - Xác nhận email đăng ký");
            helper.setFrom(mailUsername);

            String htmlContent = String.format(
                    "<html><body>" +
                    "<h2>Xin chào %s,</h2>" +
                    "<p>Cảm ơn bạn đã đăng ký tài khoản tại CareerAI.</p>" +
                    "<p>Vui lòng nhấn vào liên kết bên dưới để xác nhận email và hoàn tất đăng ký:</p>" +
                    "<p><a href='%s' style='display:inline-block;background-color:#4F46E5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;'>Xác nhận Email</a></p>" +
                    "<p>Hoặc sao chép và dán liên kết này vào trình duyệt của bạn:</p>" +
                    "<p><a href='%s'>%s</a></p>" +
                    "<br/>" +
                    "<p>Liên kết này có hiệu lực trong vòng 24 giờ.</p>" +
                    "<p>Trân trọng,<br/>Đội ngũ CareerAI</p>" +
                    "</body></html>",
                    fullName, verificationUrl, verificationUrl, verificationUrl
            );

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Verification email sent successfully to {}", email);

        } catch (Exception ex) {
            log.error("Failed to send verification email to {}. Error: {}", email, ex.getMessage());
            log.warn("=== FALLBACK MANUAL VERIFICATION ===");
            log.warn("Use this URL to manually verify the email for '{}' ({}) in dev environment:", fullName, email);
            log.warn("URL: {}", verificationUrl);
            log.warn("====================================");
        }
    }

    @Override
    public void sendPasswordResetEmail(String email, String fullName, String resetUrl) {
        log.info("Generating password reset email for {}. URL: {}", email, resetUrl);

        if (mailUsername == null || mailUsername.trim().isEmpty()) {
            log.warn("=== EMAIL SMTP IS NOT CONFIGUERD ===");
            log.warn("To reset password for user '{}' ({}), open this URL in your browser:", fullName, email);
            log.warn("URL: {}", resetUrl);
            log.warn("====================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(
                    message, 
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, 
                    StandardCharsets.UTF_8.name()
            );

            helper.setTo(email);
            helper.setSubject("CareerAI - Đặt lại mật khẩu");
            helper.setFrom(mailUsername);

            String htmlContent = String.format(
                    "<html><body>" +
                    "<h2>Xin chào %s,</h2>" +
                    "<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản CareerAI của bạn.</p>" +
                    "<p>Vui lòng nhấn vào liên kết bên dưới để tạo mật khẩu mới (Liên kết có hiệu lực trong 15 phút):</p>" +
                    "<p><a href='%s' style='display:inline-block;background-color:#4F46E5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;'>Đặt lại mật khẩu</a></p>" +
                    "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>" +
                    "<br><p>Trân trọng,<br>Đội ngũ CareerAI</p>" +
                    "</body></html>",
                    fullName, resetUrl
            );

            helper.setText(htmlContent, true); // true indicates HTML content
            mailSender.send(message);
            log.info("Password reset email sent successfully to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", email, e);
        }
    }
}
