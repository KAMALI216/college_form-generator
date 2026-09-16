package com.collegeformgenerator.backend.controller;

import com.collegeformgenerator.backend.dto.SubmissionRequest;
import com.collegeformgenerator.backend.dto.SubmissionResponse;
import com.collegeformgenerator.backend.dto.UserSubmissionResponse;
import com.collegeformgenerator.backend.dto.AdminSubmissionDetailResponse;
import com.collegeformgenerator.backend.entity.FormSubmission;
import com.collegeformgenerator.backend.entity.FormTemplate;
import com.collegeformgenerator.backend.entity.User;
import com.collegeformgenerator.backend.exception.ApiException;
import com.collegeformgenerator.backend.repository.FormSubmissionRepository;
import com.collegeformgenerator.backend.repository.FormTemplateRepository;
import com.collegeformgenerator.backend.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import com.collegeformgenerator.backend.dto.AdminSubmissionSummaryResponse;
import com.collegeformgenerator.backend.repository.AdminSubmissionSummaryProjection;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final FormSubmissionRepository submissionRepository;
    private final FormTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public SubmissionController(
            FormSubmissionRepository submissionRepository,
            FormTemplateRepository templateRepository,
            UserRepository userRepository,
            ObjectMapper objectMapper) {
        this.submissionRepository = submissionRepository;
        this.templateRepository = templateRepository;
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<SubmissionResponse> createSubmission(@Valid @RequestBody SubmissionRequest request) {
        // 1. Verify template exists
        if (!templateRepository.existsById(request.formId())) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Form template not found");
        }

        // 2. Extract authenticated userId from SecurityContext
        Integer userId = (Integer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 3. Map to entity and save
        FormSubmission submission = new FormSubmission();
        submission.setFormId(request.formId());
        submission.setUserId(userId);
        submission.setSubmission(serializeSubmission(request.submission()));
        submission.setStatus(com.collegeformgenerator.backend.entity.SubmissionStatus.PENDING);

        FormSubmission saved = submissionRepository.save(submission);

        SubmissionResponse response = new SubmissionResponse(
                saved.getId(),
                saved.getFormId(),
                saved.getSubmittedAt()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my-stats")
    public ResponseEntity<Map<String, Object>> getMyStats() {
        Integer userId = (Integer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        List<FormSubmission> submissions = submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);
        
        long pending = submissions.stream().filter(s -> com.collegeformgenerator.backend.entity.SubmissionStatus.PENDING.equals(s.getStatus())).count();
        long approved = submissions.stream().filter(s -> com.collegeformgenerator.backend.entity.SubmissionStatus.APPROVED.equals(s.getStatus())).count();
        long correction = submissions.stream().filter(s -> com.collegeformgenerator.backend.entity.SubmissionStatus.CORRECTION_REQUIRED.equals(s.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("total", submissions.size());
        stats.put("pending", pending);
        stats.put("approved", approved);
        stats.put("correction", correction);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/my")
    public ResponseEntity<List<UserSubmissionResponse>> getMySubmissions() {
        // 1. Extract authenticated userId
        Integer userId = (Integer) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        // 2. Query user's submissions sorted by submittedAt descending
        List<FormSubmission> submissions = submissionRepository.findByUserIdOrderBySubmittedAtDesc(userId);

        // 3. Map submissions, including lookup for formName
        List<UserSubmissionResponse> responseList = submissions.stream()
                .map(sub -> {
                    String formName = templateRepository.findById(sub.getFormId())
                            .map(FormTemplate::getFormName)
                            .orElse("Deleted Form");

                    return new UserSubmissionResponse(
                            sub.getId(),
                            sub.getFormId(),
                            formName,
                            deserializeSubmission(sub.getSubmission()),
                            sub.getStatus() != null ? sub.getStatus() : com.collegeformgenerator.backend.entity.SubmissionStatus.PENDING,
                            sub.getAdminComment(),
                            sub.getSubmittedAt()
                    );
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/admin")
    public ResponseEntity<List<AdminSubmissionSummaryResponse>> getAdminSubmissions() {
        List<AdminSubmissionSummaryResponse> responseList = submissionRepository.findAllAdminSubmissions().stream()
                .map(proj -> new AdminSubmissionSummaryResponse(
                        proj.getSubmissionId(),
                        proj.getFormId(),
                        proj.getFormName(),
                        proj.getSubmittedByName(),
                        proj.getSubmittedByEmail(),
                        proj.getSubmittedAt(),
                        proj.getStatus() != null ? proj.getStatus().name() : "PENDING"
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(responseList);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminSubmissionDetailResponse> getSubmissionById(@PathVariable Long id) {
        FormSubmission sub = submissionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Submission not found"));
        
        FormTemplate template = templateRepository.findById(sub.getFormId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Form template not found"));
                
        User user = userRepository.findById(sub.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
                
        AdminSubmissionDetailResponse.StudentDetail student = new AdminSubmissionDetailResponse.StudentDetail(
                user.getId(),
                user.getFullName(),
                user.getEmail()
        );
        
        AdminSubmissionDetailResponse.FormDetail form = new AdminSubmissionDetailResponse.FormDetail(
                template.getId(),
                template.getFormName()
        );
                
        AdminSubmissionDetailResponse response = new AdminSubmissionDetailResponse(
                sub.getId(),
                sub.getStatus() != null ? sub.getStatus() : com.collegeformgenerator.backend.entity.SubmissionStatus.PENDING,
                sub.getUserId(),
                student,
                form,
                deserializeSubmission(template.getFormSchema()),
                deserializeSubmission(sub.getSubmission()),
                sub.getAdminComment(),
                sub.getSubmittedAt()
        );
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AdminSubmissionDetailResponse> updateSubmissionStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        FormSubmission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Submission not found"));
                
        String statusStr = request.get("status");
        if (statusStr != null) {
            try {
                com.collegeformgenerator.backend.entity.SubmissionStatus status = 
                    com.collegeformgenerator.backend.entity.SubmissionStatus.valueOf(statusStr.toUpperCase());
                submission.setStatus(status);
            } catch (IllegalArgumentException e) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status value");
            }
        }
        
        String comment = request.get("adminComment");
        if (comment != null) {
            submission.setAdminComment(comment);
        }
        
        FormSubmission saved = submissionRepository.save(submission);
        return ResponseEntity.ok(getSubmissionById(saved.getId()).getBody());
    }

    private String serializeSubmission(Object submission) {
        if (submission == null) return null;
        try {
            if (submission instanceof String str) {
                objectMapper.readTree(str);
                return str;
            }
            return objectMapper.writeValueAsString(submission);
        } catch (JsonProcessingException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid submission JSON format");
        }
    }

    private Object deserializeSubmission(String submissionStr) {
        if (submissionStr == null) {
            return null;
        }
        try {
            com.fasterxml.jackson.databind.JsonNode node = objectMapper.readTree(submissionStr);
            if (node.isTextual()) {
                return objectMapper.readTree(node.asText());
            }
            return node;
        } catch (JsonProcessingException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to parse stored submission JSON");
        }
    }
}
