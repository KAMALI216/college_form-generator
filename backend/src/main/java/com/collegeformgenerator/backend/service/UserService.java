package com.collegeformgenerator.backend.service;

import com.collegeformgenerator.backend.dto.AdminSignupRequest;
import com.collegeformgenerator.backend.dto.AuthResponse;
import com.collegeformgenerator.backend.dto.LoginRequest;
import com.collegeformgenerator.backend.dto.SignupRequest;
import com.collegeformgenerator.backend.entity.User;
import com.collegeformgenerator.backend.entity.UserRole;
import com.collegeformgenerator.backend.exception.ApiException;
import com.collegeformgenerator.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Objects;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.secret-key:8807634655}")
    private String adminSecretKey;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public AuthResponse register(SignupRequest request) {
        return registerUser(request.fullName(), request.email(), request.password(), UserRole.USER, "User created successfully");
    }

    @Transactional
    public AuthResponse registerAdmin(AdminSignupRequest request) {
        String submittedSecretKey = request.secretKey() == null ? "" : request.secretKey().trim();
        if (!Objects.equals(adminSecretKey, submittedSecretKey)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Invalid Secret Key");
        }

        return registerUser(
                request.fullName(),
                request.email(),
                request.password(),
                UserRole.ADMIN,
                "Admin Account Created Successfully");
    }

    private AuthResponse registerUser(String fullName, String email, String password, UserRole role, String successMessage) {
        String normalizedEmail = email.trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setFullName(fullName.trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);

        logger.info("Saving user to repository: fullName={}, email={}, role={}", user.getFullName(), user.getEmail(), user.getRole());

        User savedUser = userRepository.save(user);
        logger.info("User saved successfully with id={}", savedUser.getId());
        return new AuthResponse(savedUser.getId(), savedUser.getFullName(), savedUser.getEmail(), savedUser.getRole(), successMessage);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.email().trim().toLowerCase();
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        UserRole requestedRole = parseRole(request.role());
        if (user.getRole() != requestedRole) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Selected role does not match this account");
        }

        return new AuthResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), "Login successful");
    }

    private UserRole parseRole(String role) {
        try {
            return UserRole.valueOf(role.trim().toUpperCase());
        } catch (IllegalArgumentException exception) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Role must be ADMIN or USER");
        }
    }
}
