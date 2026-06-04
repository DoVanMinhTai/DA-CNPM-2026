package nlu.fit.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateQuestionsResponse {

    private UUID interviewId;
    private UUID cvId;
    private String candidateName;
    private String targetJobTitle;
    private String difficulty;
    private OffsetDateTime createdAt;
    private List<QuestionDTO> questions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionDTO {
        private String id;
        private String category;      // "technical", "experience", "behavioral", "project"
        private String question;
        private String context;        // Why this question is being asked
        private String idealAnswer;    // Key points for evaluation
        private String difficulty;     // "junior", "mid", "senior"
        private RubricDTO rubric;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RubricDTO {
        private String score5;  // Excellent criteria
        private String score3;  // Average criteria
        private String score1;  // Poor criteria
    }
}
