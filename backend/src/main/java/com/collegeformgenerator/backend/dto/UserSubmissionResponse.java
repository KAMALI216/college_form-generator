package com.collegeformgenerator.backend.dto;

import java.time.LocalDateTime;

public record UserSubmissionResponse(
        Long id,
        Integer formId,
        String formName,
        Object submission,
        com.collegeformgenerator.backend.entity.SubmissionStatus status,
        String adminComment,
        LocalDateTime submittedAt
) {}
