package nlu.fit.backend.service;

import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

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
}