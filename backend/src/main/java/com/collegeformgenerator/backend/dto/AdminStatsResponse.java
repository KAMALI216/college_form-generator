package com.collegeformgenerator.backend.dto;

public record AdminStatsResponse(
        long totalTemplates,
        long draftTemplates,
        long approvedTemplates,
        long totalSubmissions,
        long submissionsToday,
        String mostUsedForm
) {}
