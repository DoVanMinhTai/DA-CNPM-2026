package nlu.fit.backend.config;

import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.service.AiServices;
import nlu.fit.backend.service.AtsEvaluatorService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class LangChain4jConfig {

    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;

    @Value("${ai.gemini.model-name}")
    private String geminiModelName;

    @Bean
    public AtsEvaluatorService atsEvaluatorService() {
        // Khởi tạo Chat Model từ thư viện langchain4j-google-ai-gemini
        GoogleAiGeminiChatModel chatModel = GoogleAiGeminiChatModel.builder()
                .apiKey(geminiApiKey)
                .modelName(geminiModelName)
                .build();

        // Build AI Service kết nối model với Interface đã định nghĩa
        return AiServices.builder(AtsEvaluatorService.class)
                .chatLanguageModel(chatModel)
                .build();
    }
}