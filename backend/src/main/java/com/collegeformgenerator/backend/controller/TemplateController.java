package com.collegeformgenerator.backend.controller;

import com.collegeformgenerator.backend.dto.TemplateRequest;
import com.collegeformgenerator.backend.dto.TemplateResponse;
import com.collegeformgenerator.backend.dto.TemplateSummaryResponse;
import com.collegeformgenerator.backend.entity.FormTemplate;
import com.collegeformgenerator.backend.exception.ApiException;
import com.collegeformgenerator.backend.repository.FormTemplateRepository;
import com.collegeformgenerator.backend.service.CategoryClassificationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.collegeformgenerator.backend.entity.TemplateStatus;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/templates")
public class TemplateController {

    private final FormTemplateRepository templateRepository;
    private final com.collegeformgenerator.backend.repository.FormSubmissionRepository submissionRepository;
    private final ObjectMapper objectMapper;
    private final CategoryClassificationService categoryClassificationService;

    public TemplateController(FormTemplateRepository templateRepository, com.collegeformgenerator.backend.repository.FormSubmissionRepository submissionRepository, ObjectMapper objectMapper, CategoryClassificationService categoryClassificationService) {
        this.templateRepository = templateRepository;
        this.submissionRepository = submissionRepository;
        this.objectMapper = objectMapper;
        this.categoryClassificationService = categoryClassificationService;
    }

    @PostMapping
    public ResponseEntity<TemplateResponse> createTemplate(@Valid @RequestBody TemplateRequest request) {
        FormTemplate template = new FormTemplate();
        template.setFormName(request.formName());
        template.setDescription(request.description());
        template.setFormSchema(serializeSchema(request.formSchema()));
        template.setStatus(TemplateStatus.DRAFT);
        
        String category = categoryClassificationService.classifyForm(request.formName(), request.description(), request.formSchema());
        template.setCategory(category);

        FormTemplate saved = templateRepository.save(template);
        TemplateResponse response = new TemplateResponse(
                saved.getId(),
                saved.getFormName(),
                saved.getDescription(),
                deserializeSchema(saved.getFormSchema()),
                saved.getStatus() != null ? saved.getStatus() : TemplateStatus.DRAFT,
                saved.getCategory(),
                saved.getCreatedAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TemplateSummaryResponse>> getAllTemplates() {
        List<TemplateSummaryResponse> list = templateRepository.findByStatus(TemplateStatus.APPROVED).stream()
                .map(t -> new TemplateSummaryResponse(
                        t.getId(),
                        t.getFormName(),
                        t.getDescription(),
                        t.getStatus() != null ? t.getStatus() : TemplateStatus.DRAFT,
                        t.getCategory(),
                        t.getCreatedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<TemplateSummaryResponse>> getAdminTemplates() {
        List<TemplateSummaryResponse> list = templateRepository.findAll().stream()
                .map(t -> new TemplateSummaryResponse(
                        t.getId(),
                        t.getFormName(),
                        t.getDescription(),
                        t.getStatus() != null ? t.getStatus() : TemplateStatus.DRAFT,
                        t.getCategory(),
                        t.getCreatedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TemplateResponse> getTemplateById(@PathVariable Integer id) {
        FormTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Template not found"));

        TemplateResponse response = new TemplateResponse(
                template.getId(),
                template.getFormName(),
                template.getDescription(),
                deserializeSchema(template.getFormSchema()),
                template.getStatus() != null ? template.getStatus() : TemplateStatus.DRAFT,
                template.getCategory(),
                template.getCreatedAt()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<TemplateResponse> approveTemplate(@PathVariable Integer id) {
        FormTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Template not found"));
        template.setStatus(TemplateStatus.APPROVED);
        FormTemplate saved = templateRepository.save(template);
        TemplateResponse response = new TemplateResponse(
                saved.getId(),
                saved.getFormName(),
                saved.getDescription(),
                deserializeSchema(saved.getFormSchema()),
                saved.getStatus() != null ? saved.getStatus() : TemplateStatus.DRAFT,
                saved.getCategory(),
                saved.getCreatedAt()
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TemplateResponse> updateTemplate(@PathVariable Integer id, @Valid @RequestBody TemplateRequest request) {
        FormTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Template not found"));
        
        template.setFormName(request.formName());
        template.setDescription(request.description());
        template.setFormSchema(serializeSchema(request.formSchema()));
        template.setStatus(TemplateStatus.DRAFT);
        
        String category = categoryClassificationService.classifyForm(request.formName(), request.description(), request.formSchema());
        template.setCategory(category);
        
        FormTemplate saved = templateRepository.save(template);
        TemplateResponse response = new TemplateResponse(
                saved.getId(),
                saved.getFormName(),
                saved.getDescription(),
                deserializeSchema(saved.getFormSchema()),
                saved.getStatus() != null ? saved.getStatus() : TemplateStatus.DRAFT,
                saved.getCategory(),
                saved.getCreatedAt()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<TemplateResponse> duplicateTemplate(@PathVariable Integer id) {
        FormTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Template not found"));

        FormTemplate duplicated = new FormTemplate();
        duplicated.setFormName(template.getFormName() + " - Copy");
        duplicated.setDescription(template.getDescription());
        duplicated.setFormSchema(template.getFormSchema());
        duplicated.setCategory(template.getCategory());
        duplicated.setStatus(TemplateStatus.DRAFT);

        FormTemplate saved = templateRepository.save(duplicated);
        TemplateResponse response = new TemplateResponse(
                saved.getId(),
                saved.getFormName(),
                saved.getDescription(),
                deserializeSchema(saved.getFormSchema()),
                saved.getStatus() != null ? saved.getStatus() : TemplateStatus.DRAFT,
                saved.getCategory(),
                saved.getCreatedAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    @jakarta.transaction.Transactional
    public ResponseEntity<Void> deleteTemplate(@PathVariable Integer id) {
        if (!templateRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Template not found");
        }
        submissionRepository.deleteByFormId(id);
        templateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String serializeSchema(Object schema) {
        if (schema == null) return null;
        try {
            if (schema instanceof String str) {
                objectMapper.readTree(str);
                return str;
            }
            return objectMapper.writeValueAsString(schema);
        } catch (JsonProcessingException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid form schema JSON format");
        }
    }

    private Object deserializeSchema(String schemaStr) {
        if (schemaStr == null) {
            return null;
        }
        try {
            com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(schemaStr);
            if (node.isTextual()) {
                return objectMapper.readTree(node.asText());
            }
            return node;
        } catch (JsonProcessingException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to parse stored form schema JSON");
        }
    }
}
