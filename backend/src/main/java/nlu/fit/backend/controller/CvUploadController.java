package nlu.fit.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.response.CvUploadResponse;
import nlu.fit.backend.exception.CvUploadException;
import nlu.fit.backend.security.UserPrincipal;
import nlu.fit.backend.service.CvUploadService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/cv")
@RequiredArgsConstructor
@Tag(name = "CV Editor", description = "Endpoints for managing CV drafts and uploads")
public class CvUploadController {

    private final CvUploadService cvUploadService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload and parse resume with Google Gemini AI", description = "Extracts text from PDF/DOCX using Apache Tika, parses it with Gemini AI, costs 1 credit.")
    public ResponseEntity<CvUploadResponse> uploadCv(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Validate File Empty
        if (file.isEmpty()) {
            throw new CvUploadException("File upload rỗng. Vui lòng chọn một file hợp lệ.", null);
        }

        // Validate File Size (5MB limit)
        long maxSizeBytes = 5 * 1024 * 1024;
        if (file.getSize() > maxSizeBytes) {
            throw new CvUploadException("Kích thước file vượt quá giới hạn 5MB.", null);
        }

        // Validate File Extensions
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            if (!extension.equals(".pdf") && !extension.equals(".docx")) {
                throw new CvUploadException("Định dạng file không hỗ trợ. Chỉ cho phép tải lên file .pdf hoặc .docx.", null);
            }
        } else {
            throw new CvUploadException("Tên file không hợp lệ.", null);
        }

        log.info("Receive upload request for file {} from user {}", 
                file.getOriginalFilename(), principal.getUser().getEmail());

        CvUploadResponse response = cvUploadService.handleCvUploadAndParsing(principal.getUser().getId(), file);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
     }

    @GetMapping("/{id}")
    @Operation(summary = "Get CV details by ID", description = "Retrieves the parsed CV content, title, and original file URL by CV ID.")
    public ResponseEntity<CvUploadResponse> getCvById(
            @PathVariable("id") java.util.UUID id,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("Receive GET CV request for ID {} from user {}", id, principal.getUser().getEmail());
        CvUploadResponse response = cvUploadService.getCvById(principal.getUser().getId(), id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("")
    @Operation(summary = "Get all CV summaries for current user")
    public ResponseEntity<java.util.List<nlu.fit.backend.dto.response.CvSummaryDto>> getCvsForUser(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        java.util.List<nlu.fit.backend.dto.response.CvSummaryDto> list = cvUploadService.getCvsByUser(principal.getUser().getId());
        return ResponseEntity.ok(list);
    }
}
