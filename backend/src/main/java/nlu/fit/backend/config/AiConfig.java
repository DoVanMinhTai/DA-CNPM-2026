package nlu.fit.backend.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.chat.request.ResponseFormat;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Value("${ai.gemini.api-key}")
    private String apiKey;

    @Value("${ai.gemini.model-name}")
    private String modelName;

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .responseFormat(ResponseFormat.JSON)
                .temperature(0.0)
                .maxRetries(3)
                .logRequestsAndResponses(true)
                .build();
    }
}
