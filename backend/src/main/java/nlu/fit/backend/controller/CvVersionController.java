package nlu.fit.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.response.CvUploadResponse;
import nlu.fit.backend.security.UserPrincipal;
import nlu.fit.backend.service.CvVersionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
@Tag(name = "CV Version", description = "Endpoints for managing CV versions")
public class CvVersionController {

    private final CvVersionService cvVersionService;

    @PostMapping(value = "/{id}/version", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Save edited CV as a new version (new CV draft)", description = "Uploads the compiled PDF file to R2 and creates a new CV draft, leaving the parent CV untouched.")
    public ResponseEntity<CvUploadResponse> createCvVersion(
            @PathVariable("id") UUID parentCvId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "content", required = false) String contentJson,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Creating a new version for CV {} from user {}", parentCvId, principal.getUser().getEmail());
        CvUploadResponse response = cvVersionService.saveCvVersion(principal.getUser().getId(), parentCvId, file, contentJson);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping(value = "/{id}/content")
    @Operation(summary = "Update CV JSON content only", description = "Updates the CV's content JSON by ID, without touching the PDF file.")
    public ResponseEntity<CvUploadResponse> updateCvContent(
            @PathVariable("id") UUID cvId,
            @RequestParam(value = "content", required = false) String contentJson,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("Receive request to update content of CV {} from user {}", cvId, principal.getUser().getEmail());
        CvUploadResponse response = cvVersionService.updateCvContent(principal.getUser().getId(), cvId, contentJson);
        return ResponseEntity.ok(response);
    }
}
