package nlu.fit.backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class CvAnalysisRouter {

    private final CvAnalyzer geminiAnalyzer;
    private final CvAnalyzer groqAnalyzer;

    public CvAnalysisRouter(
            @Qualifier("geminiCvAnalyzer") CvAnalyzer geminiAnalyzer,
            @Qualifier("groqCvAnalyzer") CvAnalyzer groqAnalyzer) {
        this.geminiAnalyzer = geminiAnalyzer;
        this.groqAnalyzer = groqAnalyzer;
    }

    public CvAnalysisService.CvAnalysisAiResult analyze(String cvContent) {
        try {
            log.info("Đang sử dụng Gemini để phân tích đánh giá CV...");
            return geminiAnalyzer.analyze(cvContent);
        } catch (Exception e) {
            log.warn("Gemini phân tích thất bại: {}. Tự động chuyển hướng sang Groq...", e.getMessage());
            try {
                log.info("Đang sử dụng Groq (Llama) làm phương án dự phòng để phân tích CV...");
                return groqAnalyzer.analyze(cvContent);
            } catch (Exception ex) {
                log.error("Tất cả các model AI phân tích CV đều sập!");
                throw ex;
            }
        }
    }
}