package nlu.fit.backend.service;

import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.exception.CvUploadException;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Service
public class TextExtractionService {

    private final Tika tika = new Tika();

    /**
     * Extracts raw text from PDF/Word/other documents using Apache Tika.
     * 
     * @param file the MultipartFile to parse
     * @return the extracted raw text
     */
    public String extractText(MultipartFile file) {
        if (file.isEmpty()) {
            throw new CvUploadException("Cannot extract text from an empty file.", null);
        }

        log.info("Extracting text from uploaded file: {}, Content-Type: {}", 
                file.getOriginalFilename(), file.getContentType());

        try (InputStream inputStream = file.getInputStream()) {
            String extractedText = tika.parseToString(inputStream);
            
            if (extractedText == null || extractedText.trim().isEmpty()) {
                throw new CvUploadException("No text could be extracted from the file. Please ensure it is not a scanned image PDF.", null);
            }

            log.info("Successfully extracted {} characters of text from {}", 
                    extractedText.length(), file.getOriginalFilename());
            
            return extractedText;
        } catch (IOException e) {
            log.error("Failed to read input stream from file", e);
            throw new CvUploadException("Failed to read file for text extraction: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Apache Tika parsing error", e);
            throw new CvUploadException("Error parsing document content: " + e.getMessage(), e);
        }
    }
}
