package nlu.fit.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.response.CvContentDto;
import nlu.fit.backend.dto.response.CvUploadResponse;
import nlu.fit.backend.entity.AiUsageLog;
import nlu.fit.backend.entity.Cv;
import nlu.fit.backend.entity.Subscription;
import nlu.fit.backend.entity.User;
import nlu.fit.backend.entity.enums.AiAction;
import nlu.fit.backend.entity.enums.CvStatus;
import nlu.fit.backend.exception.CvUploadException;
import nlu.fit.backend.exception.InsufficientCreditsException;
import nlu.fit.backend.exception.UserNotFoundException;
import nlu.fit.backend.repository.AiUsageLogRepository;
import nlu.fit.backend.repository.CvRepository;
import nlu.fit.backend.repository.SubscriptionRepository;
import nlu.fit.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.OffsetDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CvUploadService {

    private final UserRepository userRepository;
    private final CvRepository cvRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AiUsageLogRepository aiUsageLogRepository;
    
    private final S3StorageService s3StorageService;
    private final TextExtractionService textExtractionService;
    private final CvParserAiService cvParserAiService;
    
    private final ObjectMapper objectMapper;

    /**
     * Handles the entire CV upload, text extraction, AI parsing, and credit deduction flow.
     * All database insertions are wrapped in @Transactional and will roll back automatically on exception.
     * 
     * @param userId the ID of the authenticated user
     * @param file the uploaded resume file
     * @return the structured response for frontend
     */
    @Transactional
    public CvUploadResponse handleCvUploadAndParsing(UUID userId, MultipartFile file) {
        log.info("Starting CV upload workflow for user {}", userId);

        // 1. Find user entity
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found: " + userId));

        // 2. Check credit balance
        Integer creditBalance = subscriptionRepository.findCreditBalanceByUserId(userId)
                .orElse(0);
        log.info("User {} current credit balance: {}", userId, creditBalance);
        
        if (creditBalance < 1) {
            log.warn("User {} has insufficient credits (balance: {})", userId, creditBalance);
            throw new InsufficientCreditsException("Số dư credit của bạn không đủ để thực hiện chức năng AI này. Vui lòng nạp thêm credit.");
        }

        // 3. Upload physical file to Cloudflare R2
        String fileUrl = s3StorageService.uploadOriginalCv(userId, file);

        // 4. Extract text using Apache Tika
        String rawText = textExtractionService.extractText(file);

        // 5. Send to Google Gemini for structured parsing
        CvContentDto cvContentDto = cvParserAiService.parseResume(rawText);

        // 6. Serialize parsed content to String JSONB format
        String jsonString;
        try {
            jsonString = objectMapper.writeValueAsString(cvContentDto);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize CV JSON content", e);
            throw new CvUploadException("Failed to save parsed data format: " + e.getMessage(), e);
        }

        // Determine title (fall back to original filename or extracted name)
        String cvTitle = "CV - Imported";
        if (cvContentDto.getPersonalInfo() != null && cvContentDto.getPersonalInfo().getFullName() != null 
                && !cvContentDto.getPersonalInfo().getFullName().trim().isEmpty()) {
            cvTitle = "CV - " + cvContentDto.getPersonalInfo().getFullName();
        } else if (file.getOriginalFilename() != null) {
            String origName = file.getOriginalFilename();
            int dotIdx = origName.lastIndexOf('.');
            cvTitle = dotIdx > 0 ? origName.substring(0, dotIdx) : origName;
        }

        // 7. Save CV record to Postgres
        Cv cvEntity = Cv.builder()
                .user(user)
                .title(cvTitle)
                .status(CvStatus.DRAFT)
                .originalFileUrl(fileUrl)
                .content(jsonString)
                .build();
        Cv savedCv = cvRepository.save(cvEntity);
        log.info("CV record saved with ID: {}", savedCv.getId());

        // 8. Log AI Usage (PostgreSQL trigger will handle credit deduction)
        AiUsageLog usageLog = AiUsageLog.builder()
                .user(user)
                .cv(savedCv)
                .action(AiAction.CV_PARSING)
                .creditsUsed((short) 1)
                .build();
        aiUsageLogRepository.save(usageLog);
        log.info("AI Usage Log saved. Trigger executed to deduct credit.");

        // Force flush Jpa to execute PostgreSQL trigger immediately in this transaction
        cvRepository.flush();
        aiUsageLogRepository.flush();

        // 9. Query updated credit balance after trigger execution
        Integer updatedCredits = subscriptionRepository.findCreditBalanceByUserId(userId)
                .orElse(creditBalance - 1); // fallback in case trigger didn't update synchronously or table lacks trigger
        log.info("Credit balance updated. Remaining: {}", updatedCredits);

        return CvUploadResponse.builder()
                .cvId(savedCv.getId())
                .title(savedCv.getTitle())
                .content(cvContentDto)
                .originalFileUrl(fileUrl)
                .remainingCredits(updatedCredits)
                .build();
    }
}
