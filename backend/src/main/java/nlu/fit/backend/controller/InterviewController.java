package nlu.fit.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.request.GenerateQuestionsRequest;
import nlu.fit.backend.dto.response.GenerateQuestionsResponse;
import nlu.fit.backend.security.UserPrincipal;
import nlu.fit.backend.service.InterviewService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/interviews")
@RequiredArgsConstructor
@Tag(name = "Interview Questions", description = "AI-powered interview question generation from CV")
public class InterviewController {

    private final InterviewService interviewService;

    /**
     * Generate interview questions based on a CV and optional job description.
     */
    @PostMapping("/generate-questions")
    @Operation(
        summary = "Generate interview questions from CV",
        description = "Analyzes a candidate's CV (and optional Job Description) using AI to generate " +
                      "tailored, categorized interview questions with evaluation rubrics."
    )
    public ResponseEntity<GenerateQuestionsResponse> generateQuestions(
            @Valid @RequestBody GenerateQuestionsRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("POST /api/v1/interviews/generate-questions - CV: {}, User: {}",
                request.getCvId(), principal.getUser().getEmail());

        try {
            GenerateQuestionsResponse response = interviewService.generateQuestions(
                    principal.getUser().getId(), request
            );
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            log.warn("Access denied: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException e) {
            log.warn("Not found: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            log.error("Error generating interview questions", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get a previously generated interview question set by ID.
     */
    @GetMapping("/{interviewId}")
    @Operation(
        summary = "Get interview questions by ID",
        description = "Retrieve a previously generated set of interview questions."
    )
    public ResponseEntity<GenerateQuestionsResponse> getInterviewById(
            @PathVariable UUID interviewId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            GenerateQuestionsResponse response = interviewService.getInterviewById(
                    principal.getUser().getId(), interviewId
            );
            return ResponseEntity.ok(response);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Get all interview question sets for a specific CV.
     */
    @GetMapping("/by-cv/{cvId}")
    @Operation(
        summary = "Get all interviews for a CV",
        description = "Retrieve all previously generated interview question sets for a specific CV."
    )
    public ResponseEntity<List<GenerateQuestionsResponse>> getInterviewsByCv(
            @PathVariable UUID cvId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            List<GenerateQuestionsResponse> responses = interviewService.getInterviewsByCvId(
                    principal.getUser().getId(), cvId
            );
            return ResponseEntity.ok(responses);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
