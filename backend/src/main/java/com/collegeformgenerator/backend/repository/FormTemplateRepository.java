package com.collegeformgenerator.backend.repository;

import com.collegeformgenerator.backend.entity.FormTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.collegeformgenerator.backend.entity.TemplateStatus;
import java.util.List;

@Repository
public interface FormTemplateRepository extends JpaRepository<FormTemplate, Integer> {
    List<FormTemplate> findByStatus(TemplateStatus status);
    long countByStatus(TemplateStatus status);
}
