package nlu.fit.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.request.GenerateQuestionsRequest;
import nlu.fit.backend.dto.request.QuestionConfig;
import nlu.fit.backend.dto.response.CvContentDto;
import nlu.fit.backend.dto.response.GenerateQuestionsResponse;
import nlu.fit.backend.dto.response.GenerateQuestionsResponse.QuestionDTO;
import nlu.fit.backend.dto.response.GenerateQuestionsResponse.RubricDTO;
import nlu.fit.backend.entity.Cv;
import nlu.fit.backend.entity.InterviewQuestion;
import nlu.fit.backend.exception.AiProcessingException;
import nlu.fit.backend.repository.CvRepository;
import nlu.fit.backend.repository.InterviewQuestionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InterviewService {

    private final CvRepository cvRepository;
    private final InterviewQuestionRepository interviewQuestionRepository;
    private final ChatLanguageModel chatLanguageModel;
    private final ObjectMapper objectMapper;

    private InterviewQuestionGenerator questionGenerator;

    // ── AI Result DTOs ───────────────────────────────────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiGeneratedQuestions {
        private String targetJobTitle;
        private String difficulty;
        private List<AiQuestion> questions;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiQuestion {
        private String id;
        private String category;
        private String question;
        private String context;
        private String idealAnswer;
        private String difficulty;
        private AiRubric rubric;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AiRubric {
        private String score5;
        private String score3;
        private String score1;
    }

    // ── LangChain4j AI Service Interface ─────────────────────────────────

    interface InterviewQuestionGenerator {
        @UserMessage(
            "Bạn là một chuyên gia phỏng vấn kỹ thuật cấp cao với nhiều năm kinh nghiệm tuyển dụng.\n\n" +
            "## NHIỆM VỤ\n" +
            "Tạo câu hỏi phỏng vấn được cá nhân hóa dựa trên CV của ứng viên và mô tả công việc (nếu có).\n\n" +
            "## THÔNG TIN CV CỦA ỨNG VIÊN\n" +
            "{{cvContent}}\n\n" +
            "## MÔ TẢ CÔNG VIỆC (JOB DESCRIPTION)\n" +
            "{{jobDescription}}\n\n" +
            "## CẤU HÌNH\n" +
            "- Danh mục câu hỏi cần tạo: {{categories}}\n" +
            "- Mức độ khó mục tiêu: {{targetDifficulty}} (nếu \"auto\", hãy tự xác định dựa trên kinh nghiệm trong CV)\n" +
            "- Số lượng câu hỏi: {{limit}}\n\n" +
            "## QUY TẮC QUAN TRỌNG\n" +
            "1. CHỈ hỏi về kỹ năng, kinh nghiệm, dự án CÓ trong CV hoặc yêu cầu trong JD\n" +
            "2. KHÔNG bịa ra thông tin không có trong CV\n" +
            "3. Mỗi câu hỏi phải có lý do rõ ràng (context) giải thích tại sao hỏi câu này\n" +
            "4. Ideal answer phải cụ thể, bao gồm các keyword/concept mà ứng viên nên đề cập\n" +
            "5. Rubric phải rõ ràng, phân biệt được điểm 5, 3, và 1\n" +
            "6. Câu hỏi behavioral nên theo format STAR (Situation, Task, Action, Result)\n" +
            "7. Nếu có JD, ưu tiên câu hỏi đánh giá sự phù hợp giữa CV và JD\n" +
            "8. Tất cả nội dung phải bằng Tiếng Việt\n\n" +
            "## PHÂN LOẠI MỨC ĐỘ KHÓ\n" +
            "- junior (0-2 năm): Khái niệm cơ bản, cú pháp, troubleshooting đơn giản\n" +
            "- mid (3-5 năm): Tích hợp hệ thống, tối ưu, trade-offs, architecture patterns\n" +
            "- senior (6+ năm): System design, scalability, leadership, mentoring, business alignment\n\n" +
            "## OUTPUT FORMAT (JSON)\n" +
            "Trả về JSON với cấu trúc chính xác sau:\n" +
            "{\n" +
            "  \"targetJobTitle\": \"<vị trí phù hợp nhất hoặc vị trí từ JD>\",\n" +
            "  \"difficulty\": \"<junior|mid|senior>\",\n" +
            "  \"questions\": [\n" +
            "    {\n" +
            "      \"id\": \"q_01\",\n" +
            "      \"category\": \"<technical|experience|behavioral|project>\",\n" +
            "      \"question\": \"<câu hỏi phỏng vấn>\",\n" +
            "      \"context\": \"<lý do tại sao hỏi câu này, liên quan đến phần nào trong CV/JD>\",\n" +
            "      \"idealAnswer\": \"<các điểm chính ứng viên nên đề cập>\",\n" +
            "      \"difficulty\": \"<junior|mid|senior>\",\n" +
            "      \"rubric\": {\n" +
            "        \"score5\": \"<tiêu chí đạt điểm xuất sắc>\",\n" +
            "        \"score3\": \"<tiêu chí đạt điểm trung bình>\",\n" +
            "        \"score1\": \"<tiêu chí đạt điểm yếu>\"\n" +
            "      }\n" +
            "    }\n" +
            "  ]\n" +
            "}"
        )
        AiGeneratedQuestions generate(
            @V("cvContent") String cvContent,
            @V("jobDescription") String jobDescription,
            @V("categories") String categories,
            @V("targetDifficulty") String targetDifficulty,
            @V("limit") int limit
        );
    }

    // ── Initialization ───────────────────────────────────────────────────

    @PostConstruct
    public void init() {
        this.questionGenerator = AiServices.builder(InterviewQuestionGenerator.class)
                .chatLanguageModel(chatLanguageModel)
                .build();
    }

    // ── Public API ───────────────────────────────────────────────────────

    /**
     * Generate interview questions for a CV, optionally matched against a job description.
     *
     * @param userId  The authenticated user's ID (for ownership verification)
     * @param request The generation request with cvId, jobDescription, and config
     * @return Structured response with generated questions
     */
    @Transactional
    public GenerateQuestionsResponse generateQuestions(UUID userId, GenerateQuestionsRequest request) {
        log.info("Generating interview questions for CV: {} by User: {}", request.getCvId(), userId);

        // 1. Fetch and verify CV ownership
        Cv cv = cvRepository.findById(request.getCvId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CV với ID: " + request.getCvId()));

        if (!cv.getUser().getId().equals(userId)) {
            throw new SecurityException("Bạn không có quyền truy cập CV này.");
        }

        // 2. Parse CV content
        CvContentDto cvContent;
        try {
            cvContent = objectMapper.readValue(cv.getContent(), CvContentDto.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse CV content JSON for CV: {}", cv.getId(), e);
            throw new AiProcessingException("Nội dung CV không hợp lệ. Vui lòng upload lại CV.");
        }

        // 3. Resolve config defaults
        QuestionConfig config = request.getConfig() != null ? request.getConfig() : QuestionConfig.builder().build();
        String categories = resolveCategories(config.getCategories());
        String targetDifficulty = config.getTargetDifficulty() != null ? config.getTargetDifficulty() : "auto";
        int limit = config.getLimit() != null ? config.getLimit() : 8;

        // 4. Build job description context
        String jobDescriptionText = request.getJobDescription() != null && !request.getJobDescription().isBlank()
                ? request.getJobDescription()
                : "Không có mô tả công việc. Hãy tạo câu hỏi dựa trên kỹ năng và kinh nghiệm trong CV.";

        // 5. Call LLM
        AiGeneratedQuestions aiResult;
        try {
            aiResult = questionGenerator.generate(
                    cv.getContent(),
                    jobDescriptionText,
                    categories,
                    targetDifficulty,
                    limit
            );
        } catch (RuntimeException e) {
            log.error("LLM question generation failed for CV: {}", cv.getId(), e);

            if (e.getMessage() != null && e.getMessage().contains("503")) {
                throw new AiProcessingException("Hệ thống AI hiện đang quá tải. Vui lòng thử lại sau ít giây!");
            }

            throw new AiProcessingException("Không thể tạo câu hỏi phỏng vấn: " + e.getMessage());
        }

        if (aiResult == null || aiResult.getQuestions() == null || aiResult.getQuestions().isEmpty()) {
            throw new AiProcessingException("AI không trả về câu hỏi nào. Vui lòng thử lại.");
        }

        // 6. Save to database
        String questionsJson;
        try {
            questionsJson = objectMapper.writeValueAsString(aiResult.getQuestions());
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize AI questions to JSON", e);
            throw new AiProcessingException("Lỗi xử lý kết quả AI: " + e.getMessage());
        }

        InterviewQuestion interviewQuestion = InterviewQuestion.builder()
                .cv(cv)
                .jobDescription(request.getJobDescription())
                .difficulty(aiResult.getDifficulty())
                .targetJobTitle(aiResult.getTargetJobTitle())
                .questions(questionsJson)
                .status("generated")
                .build();

        interviewQuestion = interviewQuestionRepository.save(interviewQuestion);

        // 7. Build response
        String candidateName = cvContent.getPersonalInfo() != null
                ? cvContent.getPersonalInfo().getFullName()
                : "N/A";

        return GenerateQuestionsResponse.builder()
                .interviewId(interviewQuestion.getId())
                .cvId(cv.getId())
                .candidateName(candidateName)
                .targetJobTitle(aiResult.getTargetJobTitle())
                .difficulty(aiResult.getDifficulty())
                .createdAt(interviewQuestion.getCreatedAt())
                .questions(mapToQuestionDTOs(aiResult.getQuestions()))
                .build();
    }

    /**
     * Get a previously generated interview question set by its ID.
     */
    @Transactional(readOnly = true)
    public GenerateQuestionsResponse getInterviewById(UUID userId, UUID interviewId) {
        InterviewQuestion interview = interviewQuestionRepository.findById(interviewId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy bộ câu hỏi với ID: " + interviewId));

        if (!interview.getCv().getUser().getId().equals(userId)) {
            throw new SecurityException("Bạn không có quyền truy cập bộ câu hỏi này.");
        }

        return mapEntityToResponse(interview);
    }

    /**
     * Get all interview question sets for a specific CV.
     */
    @Transactional(readOnly = true)
    public List<GenerateQuestionsResponse> getInterviewsByCvId(UUID userId, UUID cvId) {
        // Verify CV ownership
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CV với ID: " + cvId));

        if (!cv.getUser().getId().equals(userId)) {
            throw new SecurityException("Bạn không có quyền truy cập CV này.");
        }

        List<InterviewQuestion> interviews = interviewQuestionRepository.findByCvIdOrderByCreatedAtDesc(cvId);
        return interviews.stream().map(this::mapEntityToResponse).toList();
    }

    // ── Private Helpers ──────────────────────────────────────────────────

    private String resolveCategories(List<String> categories) {
        if (categories == null || categories.isEmpty()) {
            return "technical, experience, behavioral, project";
        }
        return String.join(", ", categories);
    }

    private List<QuestionDTO> mapToQuestionDTOs(List<AiQuestion> aiQuestions) {
        if (aiQuestions == null) return new ArrayList<>();

        return aiQuestions.stream().map(aq -> QuestionDTO.builder()
                .id(aq.getId())
                .category(aq.getCategory())
                .question(aq.getQuestion())
                .context(aq.getContext())
                .idealAnswer(aq.getIdealAnswer())
                .difficulty(aq.getDifficulty())
                .rubric(aq.getRubric() != null ? RubricDTO.builder()
                        .score5(aq.getRubric().getScore5())
                        .score3(aq.getRubric().getScore3())
                        .score1(aq.getRubric().getScore1())
                        .build() : null)
                .build()
        ).toList();
    }

    private GenerateQuestionsResponse mapEntityToResponse(InterviewQuestion entity) {
        // Parse CV content for candidate name
        String candidateName = "N/A";
        try {
            CvContentDto cvContent = objectMapper.readValue(entity.getCv().getContent(), CvContentDto.class);
            if (cvContent.getPersonalInfo() != null && cvContent.getPersonalInfo().getFullName() != null) {
                candidateName = cvContent.getPersonalInfo().getFullName();
            }
        } catch (Exception e) {
            log.warn("Failed to parse CV content for candidate name", e);
        }

        // Parse questions JSON
        List<QuestionDTO> questionDTOs = new ArrayList<>();
        try {
            List<AiQuestion> aiQuestions = objectMapper.readValue(
                    entity.getQuestions(),
                    new TypeReference<List<AiQuestion>>() {}
            );
            questionDTOs = mapToQuestionDTOs(aiQuestions);
        } catch (Exception e) {
            log.warn("Failed to parse questions JSON for interview: {}", entity.getId(), e);
        }

        return GenerateQuestionsResponse.builder()
                .interviewId(entity.getId())
                .cvId(entity.getCv().getId())
                .candidateName(candidateName)
                .targetJobTitle(entity.getTargetJobTitle())
                .difficulty(entity.getDifficulty())
                .createdAt(entity.getCreatedAt())
                .questions(questionDTOs)
                .build();
    }
}
