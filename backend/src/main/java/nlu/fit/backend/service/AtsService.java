package nlu.fit.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import nlu.fit.backend.dto.response.AtsEvaluationResult;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j // Dùng để log lại thông báo khi chuyển đổi model
public class AtsService {

    private final CvAnalyzer geminiCvAnalyzer;
    private final CvAnalyzer groqCvAnalyzer;
    private final ObjectMapper objectMapper;

    // Inject cả 2 bean đã cấu hình từ AiConfig của bạn
    public AtsService(
            @Qualifier("geminiCvAnalyzer") CvAnalyzer geminiCvAnalyzer,
            @Qualifier("groqCvAnalyzer") CvAnalyzer groqCvAnalyzer,
            ObjectMapper objectMapper) {
        this.geminiCvAnalyzer = geminiCvAnalyzer;
        this.groqCvAnalyzer = groqCvAnalyzer;
        this.objectMapper = objectMapper;
    }

    public AtsEvaluationResult scoreCvAgainstJd(Object cvPayload, String jobDescription) {
        try {
            // Khấu trừ phần content của CV để gửi lên AI (hoặc gửi nguyên cvPayload tùy bạn cấu hình)
            String cvJsonString = objectMapper.writeValueAsString(cvPayload);

            try {
                // 1. Thử chạy bằng Gemini trước
                return geminiCvAnalyzer.evaluateAts(cvJsonString, jobDescription);
            } catch (Exception e) {
                // 2. Nếu Gemini lỗi (Quá tải, hết hạn mức...), bắt lỗi và chuyển sang Groq
                log.warn("Gemini đang quá tải hoặc gặp sự cố. Tự động chuyển hướng sang Groq (Llama 3.3)... Chi tiết lỗi: {}", e.getMessage());

                return groqCvAnalyzer.evaluateAts(cvJsonString, jobDescription);
            }

        } catch (Exception e) {
            log.error("Cả hai mô hình Gemini và Groq đều thất bại khi xử lý chấm điểm ATS.");
            throw new RuntimeException("Hệ thống chấm điểm ATS hiện tại không khả dụng: " + e.getMessage(), e);
        }
    }
}