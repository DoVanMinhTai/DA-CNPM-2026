package nlu.fit.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.response.CvAnalysisResponse;
import nlu.fit.backend.security.UserPrincipal;
import nlu.fit.backend.service.CvAnalysisService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/cv-analysis")
@RequiredArgsConstructor
@Tag(name = "CV Analysis", description = "Endpoints for retrieving AI analysis results of CVs")
public class CvAnalysisController {

    private final CvAnalysisService cvAnalysisService;

    @GetMapping("/{cvId}")
    @Operation(summary = "Get or trigger AI analysis for a specific CV", description = "Calculates overall score, ATS compliance, matched/missing keywords, and improvements using Gemini AI.")
    public ResponseEntity<CvAnalysisResponse> getCvAnalysis(
            @PathVariable("cvId") UUID cvId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("Received request for CV Analysis of CV: {} from user: {}", cvId, principal.getUser().getEmail());

        try {
            CvAnalysisResponse response = cvAnalysisService.getOrCreateAnalysis(principal.getUser().getId(), cvId);
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            log.warn("Access denied for user: {} to CV: {}", principal.getUser().getEmail(), cvId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException e) {
            log.warn("CV not found or invalid: {}", cvId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error generating/retrieving CV Analysis", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
