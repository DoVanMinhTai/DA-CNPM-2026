package nlu.fit.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CvSummaryDto {
    private UUID id;
    private String title;
    private Short score; // atsScore
    private String status;
    private OffsetDateTime updatedAt;
}
