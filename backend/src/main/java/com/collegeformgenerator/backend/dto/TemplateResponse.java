package com.collegeformgenerator.backend.dto;

import com.collegeformgenerator.backend.entity.TemplateStatus;
import java.time.LocalDateTime;

public record TemplateResponse(
        Integer id,
        String formName,
        String description,
        Object formSchema,
        TemplateStatus status,
        String category,
        LocalDateTime createdAt
) {}
