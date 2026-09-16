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

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StructurerService {

    private static final Logger logger = LoggerFactory.getLogger(StructurerService.class);

    @Value("${json.structurer.url:http://localhost:5002/structure-schema}")
    private String structurerUrl;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public StructurerService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
    }

    public List<Object> structureSchema(String extractedText, List<Object> rawSchema) {
        try {
            logger.info("Calling StructurerService at {} to refine schema...", structurerUrl);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("extractedText", extractedText);
            requestBody.put("rawSchema", rawSchema);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<String> response = restTemplate.postForEntity(structurerUrl, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.has("formSchema") && root.get("formSchema").isArray()) {
                    List<Object> structuredSchema = new ArrayList<>();
                    for (JsonNode element : root.get("formSchema")) {
                        structuredSchema.add(objectMapper.convertValue(element, Object.class));
                    }
                    logger.info("Successfully structured schema");
                    return structuredSchema;
                } else {
                    logger.warn("Structurer service returned invalid response format: {}", response.getBody());
                }
            } else {
                logger.warn("Structurer service returned non-2xx status code: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            logger.error("Failed to structure schema, falling back to raw schema. Error: {}", e.getMessage());
        }
        
        return rawSchema; // Fallback to raw schema
    }
}
