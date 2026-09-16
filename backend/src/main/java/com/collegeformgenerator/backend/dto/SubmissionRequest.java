package com.collegeformgenerator.backend.dto;

import jakarta.validation.constraints.NotNull;

public record SubmissionRequest(
        @NotNull(message = "Form ID is required")
        Integer formId,

        @NotNull(message = "Submission data is required")
        Object submission
) {}
