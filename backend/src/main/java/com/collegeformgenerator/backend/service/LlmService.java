
package com.collegeformgenerator.backend.service;

import com.collegeformgenerator.backend.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Service
public class LlmService {

    private static final org.slf4j.Logger logger =
            org.slf4j.LoggerFactory.getLogger(LlmService.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String localLlmUrl;
    private final int llmTimeoutSeconds;

    public LlmService(
            WebClient.Builder webClientBuilder,
            ObjectMapper objectMapper,
            @Value("${llm.local.url}") String localLlmUrl,
            @Value("${llm.timeout.seconds:240}") int llmTimeoutSeconds) {

        this.webClient = webClientBuilder.build();
        this.objectMapper = objectMapper;
        this.localLlmUrl = localLlmUrl;
        this.llmTimeoutSeconds = llmTimeoutSeconds;
    }

    public String generateSchema(String ocrText) {

        if (ocrText == null || ocrText.isBlank()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "OCR text is empty. Cannot generate form schema."
            );
        }

        long startTime = System.currentTimeMillis();

        logger.info("Calling local LLM endpoint: {}", localLlmUrl);
        logger.info("OCR text length: {} characters", ocrText.length());

        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("extractedText", ocrText);

        try {

            JsonNode response = webClient
                    .post()
                    .uri(localLlmUrl)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .timeout(Duration.ofSeconds(llmTimeoutSeconds))
                    .block();

            long timeTaken = System.currentTimeMillis() - startTime;

            logger.info(
                    "Local LLM response received in {} ms",
                    timeTaken
            );

            if (response == null || response.isNull()) {

                throw new ApiException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Null response from local LLM."
                );
            }

            /*
             * Successful response:
             *
             * {
             *   "formSchema": [...]
             * }
             */
            if (response.has("formSchema")) {

                JsonNode schemaNode = response.get("formSchema");

                if (!schemaNode.isArray()) {

                    throw new ApiException(
                            HttpStatus.INTERNAL_SERVER_ERROR,
                            "Local LLM returned an invalid formSchema."
                    );
                }

                return objectMapper.writeValueAsString(schemaNode);
            }

            /*
             * Failed response:
             *
             * {
             *   "error": "...",
             *   "raw": "..."
             * }
             */
            if (response.has("error")) {

                String raw = response.has("raw")
                        ? response.get("raw").asText()
                        : "N/A";

                logger.error(
                        "Local LLM failed to generate schema: {}",
                        raw
                );

                throw new ApiException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Local LLM failed to generate valid schema: " + raw
                );
            }

            throw new ApiException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unexpected response format from local LLM."
            );

        } catch (WebClientResponseException e) {

            logger.error(
                    "Local LLM returned HTTP {}: {}",
                    e.getStatusCode().value(),
                    e.getResponseBodyAsString()
            );

            throw new ApiException(
                    HttpStatus.valueOf(e.getStatusCode().value()),
                    "Local LLM returned HTTP error: "
                            + e.getResponseBodyAsString()
            );

        } catch (WebClientRequestException e) {

            logger.error(
                    "Could not connect to local LLM server: {}",
                    e.getMessage()
            );

            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Local LLM server is not reachable. "
                            + "Make sure it is running on port 5001."
            );

        } catch (ApiException e) {

            throw e;

        } catch (Exception e) {

            logger.error(
                    "Unexpected local LLM error",
                    e
            );

            if (isTimeoutException(e)) {

                throw new ApiException(
                        HttpStatus.GATEWAY_TIMEOUT,
                        "Local LLM request timed out after "
                                + llmTimeoutSeconds
                                + " seconds."
                );
            }

            throw new ApiException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Local LLM Exception: " + e.getMessage()
            );
        }
    }

    private boolean isTimeoutException(Throwable throwable) {

        Throwable current = throwable;

        while (current != null) {

            if (current instanceof java.util.concurrent.TimeoutException) {
                return true;
            }

            current = current.getCause();
        }

        return false;
    }
}

