package nlu.fit.backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.config.S3ConfigProperties;
import nlu.fit.backend.exception.CvUploadException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3StorageService {

    private final S3Client s3Client;
    private final S3ConfigProperties properties;

    public String uploadOriginalCv(UUID userId, MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "resume";
        }

        // Key format: cvs/{userId}/{uuid}_{originalFilename}
        String key = String.format("cvs/%s/%s_%s",
                userId.toString(),
                UUID.randomUUID().toString().substring(0, 8),
                originalFilename
        );

        try {
            log.info("Uploading file {} to Cloudflare R2 bucket {} with key {}",
                    originalFilename, properties.getBucketName(), key);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(properties.getBucketName())
                    .key(key)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            String publicDomain = "yhohvphkszvivyjefryr.supabase.co"; // Bạn có thể chuyển chuỗi này vào file properties nếu muốn

            String fileUrl = String.format("https://%s/storage/v1/object/public/%s/%s",
                    publicDomain,
                    properties.getBucketName(),
                    key
            );
            // ================================================================

            log.info("Uploaded successfully. Public URL: {}", fileUrl);
            return fileUrl;
        } catch (IOException e) {
            log.error("Failed to upload file to R2", e);
            throw new CvUploadException("Failed to upload file to storage: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("AWS S3 client exception", e);
            throw new CvUploadException("Storage service error: " + e.getMessage(), e);
        }
    }

}
