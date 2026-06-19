package nlu.fit.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.response.CvContentDto;
import nlu.fit.backend.dto.response.CvUploadResponse;
import nlu.fit.backend.entity.Cv;
import nlu.fit.backend.entity.enums.CvStatus;
import nlu.fit.backend.exception.CvUploadException;
import nlu.fit.backend.repository.CvRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CvVersionService {

    private final CvRepository cvRepository;
    private final S3StorageService s3StorageService;
    private final ObjectMapper objectMapper;

    @Transactional
    public CvUploadResponse saveCvVersion(UUID userId, UUID parentCvId, MultipartFile file, String contentJson) {
        log.info("Saving new version of CV {} for user {}", parentCvId, userId);
        Cv parentCv = cvRepository.findById(parentCvId)
                .orElseThrow(() -> new CvUploadException("Không tìm thấy CV gốc với ID: " + parentCvId, null));

        if (!parentCv.getUser().getId().equals(userId)) {
            throw new CvUploadException("Bạn không có quyền sao chép CV này.", null);
        }

        // 1. Upload new file to Cloudflare R2
        String fileUrl = s3StorageService.uploadOriginalCv(userId, file);

        // 2. Set title of new version
        String newTitle = parentCv.getTitle() + " (Version)";

        // 3. Create new CV draft
        Cv newCv = Cv.builder()
                .user(parentCv.getUser())
                .title(newTitle)
                .status(CvStatus.DRAFT)
                .originalFileUrl(fileUrl)
                .content(contentJson != null && !contentJson.trim().isEmpty() ? contentJson : parentCv.getContent())
                .build();

        Cv savedCv = cvRepository.save(newCv);
        cvRepository.flush();

        CvContentDto cvContentDto = null;
        try {
            cvContentDto = objectMapper.readValue(savedCv.getContent(), CvContentDto.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize CV content JSON", e);
            throw new CvUploadException("Định dạng dữ liệu CV không hợp lệ", e);
        }

        return CvUploadResponse.builder()
                .cvId(savedCv.getId())
                .title(savedCv.getTitle())
                .content(cvContentDto)
                .originalFileUrl(fileUrl)
                .updatedAt(savedCv.getUpdatedAt())
                .build();
    }

    @Transactional
    public CvUploadResponse updateCvContent(UUID userId, UUID cvId, String contentJson) {
        log.info("Updating JSON content of CV {} for user {}", cvId, userId);
        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new CvUploadException("Không tìm thấy CV với ID: " + cvId, null));

        if (!cv.getUser().getId().equals(userId)) {
            throw new CvUploadException("Bạn không có quyền cập nhật CV này.", null);
        }

        if (contentJson != null && !contentJson.trim().isEmpty()) {
            cv.setContent(contentJson);
        }

        Cv savedCv = cvRepository.save(cv);
        cvRepository.flush();

        CvContentDto cvContentDto = null;
        try {
            cvContentDto = objectMapper.readValue(savedCv.getContent(), CvContentDto.class);
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize CV JSON content", e);
            throw new CvUploadException("Định dạng dữ liệu CV không hợp lệ: " + e.getMessage(), e);
        }

        return CvUploadResponse.builder()
                .cvId(savedCv.getId())
                .title(savedCv.getTitle())
                .content(cvContentDto)
                .originalFileUrl(savedCv.getOriginalFileUrl())
                .updatedAt(savedCv.getUpdatedAt())
                .build();
    }
}
