package nlu.fit.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import jakarta.annotation.PostConstruct;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nlu.fit.backend.dto.response.CvAnalysisResponse;
import nlu.fit.backend.entity.Cv;
import nlu.fit.backend.entity.CvAnalysis;
import nlu.fit.backend.repository.CvAnalysisRepository;
import nlu.fit.backend.repository.CvRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CvAnalysisService {

    private final CvRepository cvRepository;
    private final CvAnalysisRepository cvAnalysisRepository;
    private final CvAnalysisRouter cvAnalysisRouter;
    private final ObjectMapper objectMapper;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CvAnalysisAiResult {
        private Short overallScore;
        private List<CvAnalysisResponse.CategoryScore> categories;
        private List<CvAnalysisResponse.Suggestion> suggestions;
        private List<String> matchedKeywords;
        private List<String> missingKeywords;
        private String targetRole;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KeywordAnalysis {
        private List<String> matched;
        private List<String> missing;
    }

    @Transactional
    public CvAnalysisResponse getOrCreateAnalysis(UUID userId, UUID cvId) {
        log.info("Requesting CV Analysis for CV: {} by User: {}", cvId, userId);

        Cv cv = cvRepository.findById(cvId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy CV với ID: " + cvId));

        if (!cv.getUser().getId().equals(userId)) {
            throw new SecurityException("Bạn không có quyền truy cập thông tin phân tích CV này.");
        }

        CvAnalysis analysis = cvAnalysisRepository.findByCvId(cvId).orElse(null);
        if (analysis == null) {
            analysis = generateAndSaveAnalysis(cv);
        }

        return mapToResponse(analysis);
    }

    private CvAnalysis generateAndSaveAnalysis(Cv cv) {
        log.info("Generating new AI Analysis for CV: {}", cv.getId());

        CvAnalysisAiResult aiResult = cvAnalysisRouter.analyze(cv.getContent());

        if (aiResult == null) {
            throw new RuntimeException("Không thể nhận kết quả phân tích từ Gemini AI.");
        }

        String strengthsJson;
        String improvementsJson;
        String keywordsJson;

        try {
            strengthsJson = objectMapper.writeValueAsString(aiResult.getCategories());
            improvementsJson = objectMapper.writeValueAsString(aiResult.getSuggestions());

            KeywordAnalysis keywordAnalysis = new KeywordAnalysis(
                    aiResult.getMatchedKeywords() != null ? aiResult.getMatchedKeywords() : new ArrayList<>(),
                    aiResult.getMissingKeywords() != null ? aiResult.getMissingKeywords() : new ArrayList<>()
            );
            keywordsJson = objectMapper.writeValueAsString(keywordAnalysis);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize CV Analysis JSON columns", e);
            throw new RuntimeException("Lỗi lưu trữ kết quả phân tích: " + e.getMessage(), e);
        }

        CvAnalysis newAnalysis = CvAnalysis.builder()
                .cv(cv)
                .score(aiResult.getOverallScore() != null ? aiResult.getOverallScore() : (short) 0)
                .strengths(strengthsJson)
                .improvements(improvementsJson)
                .keywordSuggestions(keywordsJson)
                .targetRole(aiResult.getTargetRole())
                .build();

        return cvAnalysisRepository.save(newAnalysis);
    }

    private CvAnalysisResponse mapToResponse(CvAnalysis analysis) {
        List<CvAnalysisResponse.CategoryScore> categories;
        List<CvAnalysisResponse.Suggestion> suggestions;
        List<String> matchedKeywords = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();

        try {
            categories = objectMapper.readValue(analysis.getStrengths(),
                    new TypeReference<List<CvAnalysisResponse.CategoryScore>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse categories JSON, using empty list", e);
            categories = new ArrayList<>();
        }

        try {
            suggestions = objectMapper.readValue(analysis.getImprovements(),
                    new TypeReference<List<CvAnalysisResponse.Suggestion>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse suggestions JSON, using empty list", e);
            suggestions = new ArrayList<>();
        }

        try {
            KeywordAnalysis keywordAnalysis = objectMapper.readValue(analysis.getKeywordSuggestions(),
                    KeywordAnalysis.class);
            if (keywordAnalysis != null) {
                if (keywordAnalysis.getMatched() != null) {
                    matchedKeywords = keywordAnalysis.getMatched();
                }
                if (keywordAnalysis.getMissing() != null) {
                    missingKeywords = keywordAnalysis.getMissing();
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse keywords JSON, using empty lists", e);
        }

        return CvAnalysisResponse.builder()
                .id(analysis.getId())
                .cvId(analysis.getCv().getId())
                .overallScore(analysis.getScore())
                .categories(categories)
                .suggestions(suggestions)
                .matchedKeywords(matchedKeywords)
                .missingKeywords(missingKeywords)
                .targetRole(analysis.getTargetRole())
                .build();
    }
}
