package nlu.fit.backend.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.response.CvContentDto;
import nlu.fit.backend.exception.CvUploadException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CvParserAiService {

    private final ChatLanguageModel chatLanguageModel;
    private CvParser cvParser;

    interface CvParser {
        @UserMessage("Bạn là một chuyên gia tuyển dụng cấp cao và chuyên gia ATS. Hãy phân tích đoạn văn bản thô (raw text) được trích xuất từ CV của ứng viên dưới đây và chuyển đổi thành định dạng JSON có cấu trúc chính xác khớp hoàn toàn với cấu trúc mong muốn.\n\n" +
                "Yêu cầu:\n" +
                "1. Trích xuất thông tin cá nhân (fullName, email, phone, location, linkedin).\n" +
                "2. Trích xuất tóm tắt nghề nghiệp (summary).\n" +
                "3. Trích xuất danh sách kinh nghiệm làm việc (experience), với các bullet points chi tiết.\n" +
                "4. Trích xuất học vấn (education), kỹ năng (skills), dự án (projects), chứng chỉ (certifications).\n" +
                "5. Nếu thông tin nào không có, hãy để trống hoặc mảng rỗng tương ứng, không được bịa ra thông tin.\n" +
                "6. Ngôn ngữ của kết quả trả về phải giữ nguyên theo ngôn ngữ của CV gốc.\n\n" +
                "Đoạn văn bản CV cần phân tích:\n" +
                "{{rawText}}")
        CvContentDto parse(@V("rawText") String rawText);
    }

    @PostConstruct
    public void init() {
        this.cvParser = AiServices.builder(CvParser.class)
                .chatLanguageModel(chatLanguageModel)
                .build();
    }

    /**
     * Parses raw resume text into structured JSON using Google Gemini.
     * 
     * @param rawText the extracted text from document
     * @return structured CvContentDto
     */
    public CvContentDto parseResume(String rawText) {
        log.info("Sending raw text (length: {}) to Gemini for parsing...", rawText.length());
        try {
            CvContentDto parsedDto = cvParser.parse(rawText);
            
            if (parsedDto == null) {
                throw new CvUploadException("Gemini returned null parsed content.", null);
            }
            
            log.info("Successfully parsed CV by Gemini. Full name: {}", 
                    parsedDto.getPersonalInfo() != null ? parsedDto.getPersonalInfo().getFullName() : "N/A");
            
            return parsedDto;
        } catch (Exception e) {
            log.error("LangChain4j / Gemini processing failed", e);
            throw new CvUploadException("Google Gemini was unable to structure the resume: " + e.getMessage(), e);
        }
    }
}
