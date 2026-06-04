package nlu.fit.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvUploadResponse {
    private UUID cvId;
    private String title;
    private CvContentDto content;
    private String originalFileUrl;
    private Integer remainingCredits;
}
