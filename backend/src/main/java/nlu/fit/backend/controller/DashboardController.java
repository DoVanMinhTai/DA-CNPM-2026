package nlu.fit.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.response.DashboardStatsResponse;
import nlu.fit.backend.security.UserPrincipal;
import nlu.fit.backend.service.DashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "User dashboard statistics")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/statistics")
    @Operation(summary = "Get dashboard statistics for current user")
    public ResponseEntity<DashboardStatsResponse> getStatistics(@AuthenticationPrincipal UserPrincipal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            DashboardStatsResponse resp = dashboardService.getStatistics(principal.getUser().getId());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            log.error("Error getting dashboard statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
