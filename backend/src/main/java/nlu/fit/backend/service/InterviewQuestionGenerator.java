package nlu.fit.backend.service;

import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

public interface InterviewQuestionGenerator {
    @UserMessage(
            "Bạn là một chuyên gia phỏng vấn kỹ thuật cấp cao với nhiều năm kinh nghiệm tuyển dụng.\n\n" +
                    "## NHIỆM VỤ\n" +
                    "Tạo câu hỏi phỏng vấn được cá nhân hóa dựa trên CV của ứng viên và mô tả công việc (nếu có).\n\n" +
                    // ... Giữ nguyên toàn bộ nội dung Prompt cũ của bạn ở đây ...
                    "  ]\n" +
                    "}"
    )
    InterviewService.AiGeneratedQuestions generate(
            @V("cvContent") String cvContent,
            @V("jobDescription") String jobDescription,
            @V("categories") String categories,
            @V("targetDifficulty") String targetDifficulty,
            @V("limit") int limit
    );
}