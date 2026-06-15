package nlu.fit.backend.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.chat.request.ResponseFormat;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.service.AiServices;
import nlu.fit.backend.service.CvAnalyzer;
import nlu.fit.backend.service.CvParserAiService;
import nlu.fit.backend.service.InterviewQuestionGenerator;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Value("${ai.gemini.api-key}")
    private String geminiApiKey;

    @Value("${ai.gemini.model-name}")
    private String geminiModelName;

    @Value("${ai.groq.api-key}")
    private String groqApiKey;

    @Value("${ai.groq.model-name}")
    private String groqModelName;

    @Value("${ai.groq.base-url}")
    private String groqBaseUrl;

    @Bean("geminiChatModel")
    public ChatLanguageModel geminiChatModel() {
        return GoogleAiGeminiChatModel.builder()
                .apiKey(geminiApiKey)
                .modelName(geminiModelName)
                .responseFormat(ResponseFormat.JSON)
                .temperature(0.0)
                .maxRetries(1)
                .build();
    }

    @Bean("groqChatModel")
    public ChatLanguageModel groqChatModel() {
        return (ChatLanguageModel) OpenAiChatModel.builder()
                .apiKey(groqApiKey)
                .baseUrl(groqBaseUrl)
                .modelName(groqModelName)
                .build();
    }

    @Bean("geminiCvParser")
    public CvParserAiService geminiCvParser(@Qualifier("geminiChatModel") ChatLanguageModel geminiChatModel) {
        return AiServices.builder(CvParserAiService.class)
                .chatLanguageModel(geminiChatModel)
                .build();
    }

    @Bean("groqCvParser")
    public CvParserAiService groqCvParser(@Qualifier("groqChatModel") ChatLanguageModel groqChatModel) {
        return AiServices.builder(CvParserAiService.class)
                .chatLanguageModel(groqChatModel)
                .build();
    }

    @Bean("geminiQuestionGenerator")
    public InterviewQuestionGenerator geminiQuestionGenerator(
            @Qualifier("geminiChatModel") ChatLanguageModel geminiChatModel) {
        return AiServices.builder(InterviewQuestionGenerator.class)
                .chatLanguageModel(geminiChatModel)
                .build();
    }

    @Bean("groqQuestionGenerator")
    public InterviewQuestionGenerator groqQuestionGenerator(
            @Qualifier("groqChatModel") ChatLanguageModel groqChatModel) {
        return AiServices.builder(InterviewQuestionGenerator.class)
                .chatLanguageModel(groqChatModel)
                .build();
    }

    @Bean("geminiCvAnalyzer")
    public CvAnalyzer geminiCvAnalyzer(@Qualifier("geminiChatModel") ChatLanguageModel geminiChatModel) {
        return AiServices.builder(CvAnalyzer.class)
                .chatLanguageModel(geminiChatModel)
                .build();
    }

    @Bean("groqCvAnalyzer")
    public CvAnalyzer groqCvAnalyzer(@Qualifier("groqChatModel") ChatLanguageModel groqChatModel) {
        return AiServices.builder(CvAnalyzer.class)
                .chatLanguageModel(groqChatModel)
                .build();
    }
}
