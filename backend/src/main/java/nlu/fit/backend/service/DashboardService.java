package nlu.fit.backend.service;

import lombok.RequiredArgsConstructor;
import nlu.fit.backend.dto.response.DashboardStatsResponse;
import nlu.fit.backend.dto.response.StatisticData;
import nlu.fit.backend.repository.CvAnalysisRepository;
import nlu.fit.backend.repository.CvRepository;
import nlu.fit.backend.repository.AiUsageLogRepository;
import nlu.fit.backend.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CvRepository cvRepository;
    private final CvAnalysisRepository cvAnalysisRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AiUsageLogRepository aiUsageLogRepository;

    public DashboardStatsResponse getStatistics(UUID userId) {
        DashboardStatsResponse resp = new DashboardStatsResponse();

        // Total CVs
        long total = cvRepository.countByUserId(userId);
        OffsetDateTime startOfMonth = OffsetDateTime.of(LocalDate.now().withDayOfMonth(1).atStartOfDay(), ZoneOffset.systemDefault().getRules().getOffset(Instant.now()));
        long thisMonth = cvRepository.countByUserIdAndCreatedAtAfter(userId, startOfMonth);
        // simple previous month calculation
        LocalDate firstOfPrev = LocalDate.now().withDayOfMonth(1).minusMonths(1);
        OffsetDateTime startOfPrevMonth = OffsetDateTime.of(firstOfPrev.atStartOfDay(), ZoneOffset.systemDefault().getRules().getOffset(Instant.now()));
        long prevMonth = cvRepository.countByUserIdAndCreatedAtAfter(userId, startOfPrevMonth) - thisMonth; // approximate
        String cvChange = (thisMonth - Math.max(0, prevMonth)) >= 0 ? "+" + (thisMonth - Math.max(0, prevMonth)) + " this month" : (thisMonth - Math.max(0, prevMonth)) + " this month";
        resp.setTotalCVs(new StatisticData(String.valueOf(total), cvChange));

        // AI analyses
        long analysesTotal = cvAnalysisRepository.countByCvUserId(userId);
        // week range
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(java.time.DayOfWeek.MONDAY);
        OffsetDateTime startOfWeekDt = OffsetDateTime.of(startOfWeek.atStartOfDay(), ZoneOffset.systemDefault().getRules().getOffset(Instant.now()));
        long thisWeek = cvAnalysisRepository.countByCvUserIdAndCreatedAtAfter(userId, startOfWeekDt);
        // previous week
        LocalDate prevWeekStart = startOfWeek.minusWeeks(1);
        OffsetDateTime prevWeekDt = OffsetDateTime.of(prevWeekStart.atStartOfDay(), ZoneOffset.systemDefault().getRules().getOffset(Instant.now()));
        long prevWeek = cvAnalysisRepository.countByCvUserIdAndCreatedAtAfter(userId, prevWeekDt) - thisWeek; // approximate
        String analysesChange = (thisWeek - Math.max(0, prevWeek)) >= 0 ? "+" + (thisWeek - Math.max(0, prevWeek)) + " this week" : (thisWeek - Math.max(0, prevWeek)) + " this week";
        resp.setAiAnalyses(new StatisticData(String.valueOf(analysesTotal), analysesChange));

        // Avg score
        Optional<Double> avgOpt = cvAnalysisRepository.findAverageScoreByUserId(userId);
        double avg = avgOpt.orElse(0.0);
        // compare with two weeks ago
        OffsetDateTime twoWeeksAgo = OffsetDateTime.now().minusWeeks(2);
        Optional<Double> prevAvgOpt = cvAnalysisRepository.findAverageScoreByUserIdSince(userId, twoWeeksAgo);
        double prevAvg = prevAvgOpt.orElse(avg);
        String changePercent = "0%";
        if (prevAvg > 0) {
            double diff = avg - prevAvg;
            int perc = (int) Math.round((diff / prevAvg) * 100);
            changePercent = (perc >= 0 ? "+" + perc : String.valueOf(perc)) + "% improvement";
        }
        resp.setAvgScore(new StatisticData(String.format("%d%%", Math.round(avg)), changePercent));

        // Credits
        Integer balance = subscriptionRepository.findCreditBalanceByUserId(userId).orElse(0);
        // used this month
        OffsetDateTime monthStart = OffsetDateTime.of(LocalDate.now().withDayOfMonth(1).atStartOfDay(), ZoneOffset.systemDefault().getRules().getOffset(Instant.now()));
        Integer used = aiUsageLogRepository.sumCreditsUsedByUserIdSince(userId, monthStart);
        if (used == null) used = 0;
        resp.setCredits(new StatisticData(String.valueOf(balance), used + " used this month"));

        return resp;
    }
}
