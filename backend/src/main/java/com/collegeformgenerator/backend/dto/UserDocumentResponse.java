package com.collegeformgenerator.backend.dto;

import java.time.LocalDateTime;

public record UserDocumentResponse(
        Long id,
        String documentType,
        String fileName,
        Long fileSize,
        String status,
        LocalDateTime uploadedAt
) {}
