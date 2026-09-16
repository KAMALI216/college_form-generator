package com.collegeformgenerator.backend.controller;

import com.collegeformgenerator.backend.entity.FormTemplate;
import com.collegeformgenerator.backend.repository.FormTemplateRepository;
import com.collegeformgenerator.backend.service.ExcelExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;

@RestController
@RequestMapping("/api/admin")
public class AdminExportController {

    private final FormTemplateRepository formTemplateRepository;
    private final ExcelExportService excelExportService;

    public AdminExportController(FormTemplateRepository formTemplateRepository, ExcelExportService excelExportService) {
        this.formTemplateRepository = formTemplateRepository;
        this.excelExportService = excelExportService;
    }

    @GetMapping("/forms/{formId}/export")
    public ResponseEntity<byte[]> exportFormSubmissionsToExcel(@PathVariable Integer formId) {
        FormTemplate template = formTemplateRepository.findById(formId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Form template not found"));

        try {
            byte[] excelBytes = excelExportService.generateExcelForForm(template);

            String filename = "form_" + formId + "_approved_submissions.xlsx";
            // Clean up filename if name exists
            if (template.getFormName() != null && !template.getFormName().isEmpty()) {
                filename = template.getFormName().replaceAll("[^a-zA-Z0-9.-]", "_") + "_Approved.xlsx";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setCacheControl("must-revalidate, post-check=0, pre-check=0");

            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to generate Excel file", e);
        }
    }
}
