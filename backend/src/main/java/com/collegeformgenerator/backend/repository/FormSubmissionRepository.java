package com.collegeformgenerator.backend.repository;

import com.collegeformgenerator.backend.entity.FormSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import jakarta.transaction.Transactional;
import java.util.List;

@Repository
public interface FormSubmissionRepository extends JpaRepository<FormSubmission, Long> {
    
    @Transactional
    void deleteByFormId(Integer formId);

    List<FormSubmission> findByUserIdOrderBySubmittedAtDesc(Integer userId);
    
    List<FormSubmission> findByFormIdAndStatus(Integer formId, com.collegeformgenerator.backend.entity.SubmissionStatus status);

    @org.springframework.data.jpa.repository.Query(value = "SELECT COUNT(*) FROM form_submissions WHERE CAST(submitted_at AS DATE) = CURRENT_DATE", nativeQuery = true)
    long countSubmissionsToday();

    @org.springframework.data.jpa.repository.Query(value = "SELECT ft.form_name FROM form_submissions fs JOIN form_templates ft ON fs.form_id = ft.id GROUP BY ft.form_name ORDER BY COUNT(fs.id) DESC LIMIT 1", nativeQuery = true)
    String findMostUsedFormName();

    @org.springframework.data.jpa.repository.Query(value = "SELECT fs.id as submissionId, fs.form_id as formId, fs.status as status, ft.form_name as formName, u.full_name as submittedByName, u.email as submittedByEmail, fs.submitted_at as submittedAt FROM form_submissions fs JOIN form_templates ft ON fs.form_id = ft.id JOIN users u ON fs.user_id = u.id ORDER BY fs.submitted_at DESC", nativeQuery = true)
    List<AdminSubmissionSummaryProjection> findAllAdminSubmissions();
}
