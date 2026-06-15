package nlu.fit.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class InterviewQuestionRouter {

    private final InterviewQuestionGenerator geminiGenerator;
    private final InterviewQuestionGenerator groqGenerator;

    public InterviewQuestionRouter(
            @Qualifier("geminiQuestionGenerator") InterviewQuestionGenerator geminiGenerator,
            @Qualifier("groqQuestionGenerator") InterviewQuestionGenerator groqGenerator) {
        this.geminiGenerator = geminiGenerator;
        this.groqGenerator = groqGenerator;
    }

    public InterviewService.AiGeneratedQuestions generate(
            String cvContent, String jobDescription, String categories, String targetDifficulty, int limit) {

        try {
            log.info("Đang gọi Google Gemini để sinh bộ câu hỏi phỏng vấn...");
            return geminiGenerator.generate(cvContent, jobDescription, categories, targetDifficulty, limit);
        } catch (Exception e) {
            log.warn("Google Gemini thất bại khi sinh câu hỏi: {}. Tự động đổi sang Groq (Llama-3)...", e.getMessage());

            try {
                log.info("Đang gọi Groq (Llama) để sinh bộ câu hỏi phỏng vấn dự phòng...");
                return groqGenerator.generate(cvContent, jobDescription, categories, targetDifficulty, limit);
            } catch (Exception ex) {
                log.error("Tất cả các Model AI sinh câu hỏi phỏng vấn đều sập hoàn toàn!");
                throw ex;
            }
        }
    }
}