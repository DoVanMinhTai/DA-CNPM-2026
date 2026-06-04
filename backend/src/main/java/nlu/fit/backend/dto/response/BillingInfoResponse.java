package nlu.fit.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingInfoResponse {
    private String plan;
    private String status;
    private Integer creditBalance;
    private OffsetDateTime nextBillingDate;
    private boolean isCancelable;
    private boolean isReactivatable;
}
