package com.collegeformgenerator.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class CategoryClassificationService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryClassificationService.class);

    // Using the same python service port that the structurer uses
    @Value("${category.classifier.url:http://localhost:5002/classify-form}")
    private String classifierUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public CategoryClassificationService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public String classifyForm(String title, String description, Object schema) {
        try {
            logger.info("Calling CategoryClassificationService at {} to classify form...", classifierUrl);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("title", title != null ? title : "");
            requestBody.put("description", description != null ? description : "");
            requestBody.put("schema", schema);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(classifierUrl, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.has("category")) {
                    String category = root.get("category").asText();
                    logger.info("Successfully classified form into category: {}", category);
                    return category;
                } else {
                    logger.warn("Classifier service returned missing category in response: {}", response.getBody());
                }
            } else {
                logger.warn("Classifier service returned non-2xx status code: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Failed to classify form, falling back to 'Other'. Error: {}", e.getMessage());
        }
        
        return "Other"; // Fallback category
    }
}
