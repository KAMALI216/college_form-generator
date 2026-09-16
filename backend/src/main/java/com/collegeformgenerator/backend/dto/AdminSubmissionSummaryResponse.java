package com.collegeformgenerator.backend.dto;

import java.time.LocalDateTime;

public record AdminSubmissionSummaryResponse(
        Long submissionId,
        Integer formId,
        String formName,
        String submittedByName,
        String submittedByEmail,
        LocalDateTime submittedAt,
        String status
) {}
