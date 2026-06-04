package nlu.fit.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionConfig {

    /**
     * Question categories to generate.
     * Valid values: "technical", "experience", "behavioral", "project"
     * Default: all categories
     */
    private List<String> categories;

    /**
     * Target difficulty level.
     * Valid values: "junior", "mid", "senior", "auto"
     * Default: "auto" (auto-detect from CV experience)
     */
    @Builder.Default
    private String targetDifficulty = "auto";

    /**
     * Total number of questions to generate.
     * Default: 8, Min: 1, Max: 20
     */
    @Min(value = 1, message = "Minimum 1 question")
    @Max(value = 20, message = "Maximum 20 questions")
    @Builder.Default
    private Integer limit = 8;
}
