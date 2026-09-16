package com.collegeformgenerator.backend.dto;

import java.time.LocalDateTime;

public record SubmissionResponse(
        Long id,
        Integer formId,
        LocalDateTime submittedAt
) {}
