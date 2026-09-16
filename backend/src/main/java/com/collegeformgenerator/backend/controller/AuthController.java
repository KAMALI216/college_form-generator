package com.collegeformgenerator.backend.controller;

import com.collegeformgenerator.backend.dto.AdminSignupRequest;
import com.collegeformgenerator.backend.dto.AuthResponse;
import com.collegeformgenerator.backend.dto.LoginRequest;
import com.collegeformgenerator.backend.dto.SignupRequest;
import com.collegeformgenerator.backend.service.UserService;
import com.collegeformgenerator.backend.security.JwtUtil;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request) {
        logger.info("Received signup request for email={}", request.email());
        AuthResponse response = userService.register(request);
        String token = jwtUtil.generateToken(response.id(), response.role());
        AuthResponse responseWithToken = new AuthResponse(
                response.id(),
                response.fullName(),
                response.email(),
                response.role(),
                token,
                response.message()
        );
        logger.info("Signup completed for id={}, email={}", response.id(), response.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseWithToken);
    }

    @PostMapping("/register-admin")
    public ResponseEntity<AuthResponse> registerAdmin(@Valid @RequestBody AdminSignupRequest request) {
        logger.info("Received admin signup request for email={}", request.email());
        AuthResponse response = userService.registerAdmin(request);
        String token = jwtUtil.generateToken(response.id(), response.role());
        AuthResponse responseWithToken = new AuthResponse(
                response.id(),
                response.fullName(),
                response.email(),
                response.role(),
                token,
                response.message()
        );
        logger.info("Admin signup completed for id={}, email={}", response.id(), response.email());
        return ResponseEntity.status(HttpStatus.CREATED).body(responseWithToken);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        String token = jwtUtil.generateToken(response.id(), response.role());
        AuthResponse responseWithToken = new AuthResponse(
                response.id(),
                response.fullName(),
                response.email(),
                response.role(),
                token,
                response.message()
        );
        return ResponseEntity.ok(responseWithToken);
    }
}
