package com.collegeformgenerator.backend.repository;

import java.time.LocalDateTime;

public interface AdminSubmissionSummaryProjection {
    Long getSubmissionId();
    Integer getFormId();
    String getFormName();
    String getSubmittedByName();
    String getSubmittedByEmail();
    LocalDateTime getSubmittedAt();
    com.collegeformgenerator.backend.entity.SubmissionStatus getStatus();
}
