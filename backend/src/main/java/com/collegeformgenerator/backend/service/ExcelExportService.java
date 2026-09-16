package com.collegeformgenerator.backend.service;

import com.collegeformgenerator.backend.entity.FormSubmission;
import com.collegeformgenerator.backend.entity.FormTemplate;
import com.collegeformgenerator.backend.entity.SubmissionStatus;
import com.collegeformgenerator.backend.repository.FormSubmissionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class ExcelExportService {

    private final FormSubmissionRepository submissionRepository;
    private final ObjectMapper objectMapper;

    public ExcelExportService(FormSubmissionRepository submissionRepository, ObjectMapper objectMapper) {
        this.submissionRepository = submissionRepository;
        this.objectMapper = objectMapper;
    }

    public byte[] generateExcelForForm(FormTemplate template) throws IOException {
        List<FormSubmission> approvedSubmissions = submissionRepository.findByFormIdAndStatus(template.getId(), SubmissionStatus.APPROVED);

        List<String> fieldLabels = extractFieldLabels(template.getFormSchema());

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Approved Submissions");

            // Header styling
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Create Header Row
            Row headerRow = sheet.createRow(0);
            
            // System columns
            String[] systemHeaders = {"Submission ID", "Student User ID", "Submitted At", "Verification Status"};
            int colIdx = 0;
            for (String h : systemHeaders) {
                Cell cell = headerRow.createCell(colIdx++);
                cell.setCellValue(h);
                cell.setCellStyle(headerStyle);
            }
            
            // Dynamic Form Columns
            for (String label : fieldLabels) {
                Cell cell = headerRow.createCell(colIdx++);
                cell.setCellValue(label);
                cell.setCellStyle(headerStyle);
            }

            // Data Rows
            int rowIdx = 1;
            for (FormSubmission sub : approvedSubmissions) {
                Row row = sheet.createRow(rowIdx++);
                
                colIdx = 0;
                // System data
                row.createCell(colIdx++).setCellValue(sub.getId());
                row.createCell(colIdx++).setCellValue(sub.getUserId() != null ? sub.getUserId().toString() : "");
                row.createCell(colIdx++).setCellValue(sub.getSubmittedAt() != null ? sub.getSubmittedAt().toString() : "");
                row.createCell(colIdx++).setCellValue(sub.getStatus() != null ? sub.getStatus().name() : "");

                // Form data
                JsonNode formData = null;
                if (sub.getSubmission() != null) {
                    formData = objectMapper.readTree(sub.getSubmission());
                    if (formData.isTextual()) {
                        formData = objectMapper.readTree(formData.asText()); // nested parse just in case
                    }
                }

                for (String label : fieldLabels) {
                    Cell cell = row.createCell(colIdx++);
                    if (formData != null && formData.has(label)) {
                        cell.setCellValue(formData.get(label).asText(""));
                    } else {
                        cell.setCellValue("");
                    }
                }
            }

            // Autosize columns
            for (int i = 0; i < systemHeaders.length + fieldLabels.size(); i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private List<String> extractFieldLabels(String formSchemaJson) {
        List<String> labels = new ArrayList<>();
        if (formSchemaJson == null || formSchemaJson.trim().isEmpty()) {
            return labels;
        }

        try {
            JsonNode schemaNode = objectMapper.readTree(formSchemaJson);
            if (schemaNode.has("sections") && schemaNode.get("sections").isArray()) {
                for (JsonNode section : schemaNode.get("sections")) {
                    if (section.has("fields") && section.get("fields").isArray()) {
                        for (JsonNode field : section.get("fields")) {
                            if (field.has("label")) {
                                labels.add(field.get("label").asText());
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            // log error if needed
        }
        return labels;
    }
}
