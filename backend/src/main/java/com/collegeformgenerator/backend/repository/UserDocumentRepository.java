package com.collegeformgenerator.backend.repository;

import com.collegeformgenerator.backend.entity.UserDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDocumentRepository extends JpaRepository<UserDocument, Long> {
    List<UserDocument> findByUserIdOrderByUploadedAtDesc(Integer userId);
    Optional<UserDocument> findByIdAndUserId(Long id, Integer userId);
}
