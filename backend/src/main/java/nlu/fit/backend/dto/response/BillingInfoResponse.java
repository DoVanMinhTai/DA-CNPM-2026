package nlu.fit.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

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
    private Integer creditsUsed;  // Credits used this month

    // Frontend-friendly computed fields
    @JsonProperty("currentPlan")
    public String getCurrentPlan() {
        return plan;
    }

    @JsonProperty("amount")
    public Long getAmount() {
        if (plan == null) return 0L;
        return switch (plan) {
            case "PROFESSIONAL" -> 500000L;
            case "ENTERPRISE" -> 2000000L;
            default -> 0L;
        };
    }

    @JsonProperty("nextBilling")
    public String getNextBilling() {
        if (nextBillingDate == null) return "N/A";
        return nextBillingDate.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    }

    @JsonProperty("credits")
    public Map<String, Integer> getCredits() {
        int total = creditBalance != null ? creditBalance : 0;
        int used = creditsUsed != null ? creditsUsed : 0;
        return Map.of("used", used, "total", total);
    }

    @JsonProperty("isCancelled")
    public boolean isCancelled() {
        return "CANCELLED".equalsIgnoreCase(status);
    }
}
