package com.collegeformgenerator.backend.controller;

import com.collegeformgenerator.backend.dto.AdminStatsResponse;
import com.collegeformgenerator.backend.entity.TemplateStatus;
import com.collegeformgenerator.backend.repository.FormSubmissionRepository;
import com.collegeformgenerator.backend.repository.FormTemplateRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final FormTemplateRepository templateRepository;
    private final FormSubmissionRepository submissionRepository;

    public AdminController(FormTemplateRepository templateRepository, FormSubmissionRepository submissionRepository) {
        this.templateRepository = templateRepository;
        this.submissionRepository = submissionRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> getStats() {
        long totalTemplates = templateRepository.count();
        long draftTemplates = templateRepository.countByStatus(TemplateStatus.DRAFT);
        long approvedTemplates = templateRepository.countByStatus(TemplateStatus.APPROVED);
        long totalSubmissions = submissionRepository.count();
        long submissionsToday = submissionRepository.countSubmissionsToday();
        String mostUsedForm = submissionRepository.findMostUsedFormName();

        AdminStatsResponse response = new AdminStatsResponse(
                totalTemplates,
                draftTemplates,
                approvedTemplates,
                totalSubmissions,
                submissionsToday,
                mostUsedForm
        );

        return ResponseEntity.ok(response);
    }
}
