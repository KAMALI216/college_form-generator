package com.collegeformgenerator.backend.dto;

import com.collegeformgenerator.backend.entity.UserRole;

public record AuthResponse(
        Integer id,
        String fullName,
        String email,
        UserRole role,
        String token,
        String message) {

    public AuthResponse(Integer id, String fullName, String email, UserRole role, String message) {
        this(id, fullName, email, role, null, message);
    }
}
