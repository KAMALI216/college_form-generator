package com.collegeformgenerator.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TemplateRequest(
        @NotBlank(message = "Form name is required")
        String formName,

        String description,

        @NotNull(message = "Form schema is required")
        Object formSchema
) {}
