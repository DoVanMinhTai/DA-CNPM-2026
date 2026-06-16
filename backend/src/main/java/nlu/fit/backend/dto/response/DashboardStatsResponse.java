package nlu.fit.backend.dto.response;

import lombok.Data;

@Data
public class DashboardStatsResponse {
    private StatisticData totalCVs;
    private StatisticData aiAnalyses;
    private StatisticData avgScore;
    private StatisticData credits;
}
