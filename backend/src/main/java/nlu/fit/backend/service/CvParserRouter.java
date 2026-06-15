package nlu.fit.backend.service;

import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.response.CvContentDto;
import nlu.fit.backend.exception.AiProcessingException;
import nlu.fit.backend.exception.CvUploadException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class CvParserRouter {

    private final CvParserAiService geminiParser;
    private final CvParserAiService groqParser;

    public CvParserRouter(
            @Qualifier("geminiCvParser") CvParserAiService geminiParser,
            @Qualifier("groqCvParser") CvParserAiService groqParser) {
        this.geminiParser = geminiParser;
        this.groqParser = groqParser;
    }

    public CvContentDto parseResume(String rawText) {
        log.info("Bắt đầu xử lý bóc tách CV. Độ dài text: {}", rawText.length());

        try {
            log.info("Đang gửi dữ liệu tới Google Gemini...");
            CvContentDto parsedDto = geminiParser.parseResume(rawText);

            if (parsedDto != null) {
                log.info("Gemini bóc tách thành công! Tên ứng viên: {}", getCandidateName(parsedDto));
                return parsedDto;
            }
            throw new CvUploadException("Gemini trả về kết quả rỗng (null).", null);

        } catch (Exception e) {
            log.error("Google Gemini gặp sự cố: {}. Đang kích hoạt cứu vớt tự động bằng Groq (Llama)...", e.getMessage());

            try {
                log.info("Đang gửi dữ liệu tới Groq (Llama)...");
                CvContentDto parsedDto = groqParser.parseResume(rawText);

                if (parsedDto != null) {
                    log.info("Groq xử lý cứu vớt thành công! Tên ứng viên: {}", getCandidateName(parsedDto));
                    return parsedDto;
                }
                throw new CvUploadException("Groq trả về kết quả rỗng (null).", null);

            } catch (Exception ex) {
                log.error("Tất cả các Model AI dự phòng (Gemini & Groq) đều thất bại!", ex);

                if (ex.getMessage() != null && ex.getMessage().contains("503")) {
                    throw new AiProcessingException("Hệ thống AI hiện đang quá tải. Vui lòng bấm thử lại sau ít giây!");
                }
                throw new AiProcessingException("Không thể bóc tách dữ liệu CV do tất cả các dịch vụ AI gặp sự cố kỹ thuật.");
            }
        }
    }

    private String getCandidateName(CvContentDto dto) {
        return dto.getPersonalInfo() != null ? dto.getPersonalInfo().getFullName() : "N/A";
    }
}