package com.collegeformgenerator.backend.controller;

import com.collegeformgenerator.backend.dto.AutocompleteRequest;
import com.collegeformgenerator.backend.dto.ReviewSchemaRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api/ai")
public class AiFeatureController {

    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public AiFeatureController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @PostMapping("/autocomplete")
    public ResponseEntity<String> autocomplete(@RequestBody AutocompleteRequest request) {
        String url = aiServiceUrl + "/autocomplete";
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }

    @PostMapping("/review-form-schema")
    public ResponseEntity<String> reviewFormSchema(@RequestBody ReviewSchemaRequest request) {
        String url = aiServiceUrl + "/review-form-schema";
        ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);
        return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
    }
}
