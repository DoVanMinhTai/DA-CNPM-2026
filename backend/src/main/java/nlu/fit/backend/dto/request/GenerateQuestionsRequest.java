package nlu.fit.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateQuestionsRequest {

    @NotNull(message = "cvId is required")
    private UUID cvId;

    /**
     * Job description text (optional but recommended).
     * If provided, questions will be tailored to match the job requirements.
     */
    private String jobDescription;

    /**
     * Optional configuration for question generation.
     * If not provided, defaults will be used.
     */
    @Valid
    private QuestionConfig config;
}
