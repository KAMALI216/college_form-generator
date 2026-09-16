package com.collegeformgenerator.backend.dto;

import com.collegeformgenerator.backend.entity.TemplateStatus;
import java.time.LocalDateTime;

public record TemplateSummaryResponse(
        Integer id,
        String formName,
        String description,
        TemplateStatus status,
        String category,
        LocalDateTime createdAt
) {}
