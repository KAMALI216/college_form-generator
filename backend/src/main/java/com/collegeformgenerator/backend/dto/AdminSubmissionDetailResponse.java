package com.collegeformgenerator.backend.dto;

import com.collegeformgenerator.backend.entity.SubmissionStatus;
import java.time.LocalDateTime;

public record AdminSubmissionDetailResponse(
        Long id,
        SubmissionStatus status,
        Integer userId,
        StudentDetail student,
        FormDetail form,
        Object formSchema,
        Object formData,
        String adminComment,
        LocalDateTime submittedAt
) {
    public record StudentDetail(
            Integer id,
            String fullName,
            String email
    ) {}

    public record FormDetail(
            Integer id,
            String title
    ) {}
}
