package nlu.fit.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvAnalysisResponse {
    private UUID id;
    private UUID cvId;
    private Short overallScore;
    private List<CategoryScore> categories;
    private List<Suggestion> suggestions;
    private List<String> matchedKeywords;
    private List<String> missingKeywords;
    private String targetRole;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryScore {
        private String name;
        private Short score;
        @Builder.Default
        private Short maxScore = 100;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Suggestion {
        private String type; // 'improvement', 'keyword', 'format'
        private String text;
    }
}
