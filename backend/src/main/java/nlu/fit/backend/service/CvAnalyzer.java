package nlu.fit.backend.service;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import nlu.fit.backend.dto.response.AtsEvaluationResult;

public interface CvAnalyzer {
    @UserMessage("Bạn là một chuyên gia tuyển dụng cấp cao và chuyên gia ATS. Hãy phân tích nội dung CV dưới dạng JSON dưới đây và đưa ra đánh giá phân tích chi tiết.\n\n" +
            "Nội dung CV (JSON):\n" +
            "{{cvContent}}\n\n" +
            "Yêu cầu đầu ra:\n" +
            "Hãy phân tích và trả về cấu trúc JSON khớp hoàn toàn với định dạng dưới đây:\n" +
            "{\n" +
            "  \"overallScore\": <điểm số tổng quan từ 0 đến 100>,\n" +
            "  \"categories\": [\n" +
            "    { \"name\": \"Content Quality\", \"score\": <điểm số 0-100>, \"maxScore\": 100 },\n" +
            "    { \"name\": \"ATS Compatibility\", \"score\": <điểm số 0-100>, \"maxScore\": 100 },\n" +
            "    { \"name\": \"Keyword Density\", \"score\": <điểm số 0-100>, \"maxScore\": 100 },\n" +
            "    { \"name\": \"Format & Structure\", \"score\": <điểm số 0-100>, \"maxScore\": 100 },\n" +
            "    { \"name\": \"Impact Metrics\", \"score\": <điểm số 0-100>, \"maxScore\": 100 }\n" +
            "  ],\n" +
            "  \"suggestions\": [\n" +
            "    { \"type\": \"improvement\" | \"keyword\" | \"format\", \"text\": \"<nội dung hướng dẫn bằng Tiếng Việt>\" }\n" +
            "  ],\n" +
            "  \"matchedKeywords\": [<mảng từ khóa kỹ năng đã có trong CV>],\n" +
            "  \"missingKeywords\": [<mảng từ khóa kỹ năng cần bổ sung>],\n" +
            "  \"targetRole\": \"<Vị trí công việc mục tiêu phù hợp nhất>\"\n" +
            "}\n" +
            "Lưu ý: Tất cả các đoạn text hướng dẫn và loại hình gợi ý trong suggestions phải viết bằng Tiếng Việt.")
    CvAnalysisService.CvAnalysisAiResult analyze(@V("cvContent") String cvContent);

    @SystemMessage("""
        Bạn là một hệ thống ATS (Applicant Tracking System) thông minh và là chuyên gia sàng lọc CV cao cấp.
        Nhiệm vụ của bạn là phân tích sâu cấu trúc dữ liệu JSON của CV người ứng tuyển, đối chiếu khắt khe với Mô tả công việc (Job Description - JD).
        Hãy tính toán chính xác điểm tương thích (0-100) dựa trên: kỹ năng (skills), kinh nghiệm (experience), học vấn, và các dự án liên quan.
        """)
    @UserMessage("""
        Hãy tiến hành chấm điểm ATS cho CV dựa trên thông tin dưới đây:
        
        [Yêu cầu công việc - Job Description (JD)]:
        {{jd}}
        
        [Dữ liệu JSON của CV ứng viên]:
        {{cvJson}}
        """)
    AtsEvaluationResult evaluateAts(@V("cvJson") String cvJson, @V("jd") String jd);
}