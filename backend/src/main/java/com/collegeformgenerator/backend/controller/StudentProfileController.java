package com.collegeformgenerator.backend.controller;

import com.collegeformgenerator.backend.entity.StudentProfile;
import com.collegeformgenerator.backend.repository.StudentProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student-profiles")
public class StudentProfileController {

    private final StudentProfileRepository repository;

    public StudentProfileController(StudentProfileRepository repository) {
        this.repository = repository;
    }

    private Integer getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Integer) {
            return (Integer) principal;
        }
        throw new RuntimeException("User not authenticated");
    }

    @GetMapping("/me")
    public ResponseEntity<StudentProfile> getMyProfile() {
        Integer userId = getAuthenticatedUserId();
        return repository.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    StudentProfile p = new StudentProfile();
                    p.setUserId(userId);
                    return ResponseEntity.ok(repository.save(p));
                });
    }

    @PutMapping("/me")
    public ResponseEntity<StudentProfile> updateMyProfile(@RequestBody StudentProfile profileData) {
        Integer userId = getAuthenticatedUserId();
        StudentProfile existing = repository.findByUserId(userId).orElse(new StudentProfile());
        
        existing.setUserId(userId);
        existing.setRegisterNumber(profileData.getRegisterNumber());
        existing.setDepartment(profileData.getDepartment());
        existing.setSemester(profileData.getSemester());
        existing.setAcademicYear(profileData.getAcademicYear());
        existing.setPhone(profileData.getPhone());
        existing.setDob(profileData.getDob());
        existing.setGender(profileData.getGender());
        existing.setParentName(profileData.getParentName());
        existing.setAddress(profileData.getAddress());
        existing.setProfileCompleted(true);
        
        return ResponseEntity.ok(repository.save(existing));
    }
}
