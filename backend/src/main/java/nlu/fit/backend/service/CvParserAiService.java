package nlu.fit.backend.service;

import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import nlu.fit.backend.dto.response.CvContentDto;

public interface CvParserAiService {

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
    CvContentDto parseResume(@V("rawText") String rawText);
}