package nlu.fit.backend.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class AtsEvaluationResult {
    private int score;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> improvements;
    private String summaryEvaluation;

}