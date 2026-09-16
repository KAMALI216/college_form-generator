package com.collegeformgenerator.backend.controller;

import com.collegeformgenerator.backend.dto.UserDocumentResponse;
import com.collegeformgenerator.backend.entity.UserDocument;
import com.collegeformgenerator.backend.repository.UserDocumentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final UserDocumentRepository documentRepository;

    public DocumentController(UserDocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserDocumentResponse>> getMyDocuments() {
        Integer userId = getAuthenticatedUserId();
        List<UserDocument> documents = documentRepository.findByUserIdOrderByUploadedAtDesc(userId);
        
        List<UserDocumentResponse> responseList = documents.stream()
                .map(doc -> new UserDocumentResponse(
                        doc.getId(),
                        doc.getDocumentType(),
                        doc.getFileName(),
                        doc.getFileSize(),
                        doc.getStatus(),
                        doc.getUploadedAt()
                ))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(responseList);
    }

    @PostMapping
    public ResponseEntity<UserDocumentResponse> uploadDocument(
            @RequestParam("documentType") String documentType,
            @RequestParam("file") MultipartFile file) throws IOException {
            
        Integer userId = getAuthenticatedUserId();

        UserDocument document = new UserDocument();
        document.setUserId(userId);
        document.setDocumentType(documentType);
        document.setFileName(file.getOriginalFilename());
        document.setFileSize(file.getSize());
        document.setContentType(file.getContentType());
        document.setFileData(file.getBytes());
        document.setStatus("VERIFIED"); // Default status

        UserDocument saved = documentRepository.save(document);

        return ResponseEntity.status(HttpStatus.CREATED).body(new UserDocumentResponse(
                saved.getId(),
                saved.getDocumentType(),
                saved.getFileName(),
                saved.getFileSize(),
                saved.getStatus(),
                saved.getUploadedAt()
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        Integer userId = getAuthenticatedUserId();
        
        return documentRepository.findByIdAndUserId(id, userId)
                .map(doc -> {
                    documentRepository.delete(doc);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private Integer getAuthenticatedUserId() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof Integer) {
            return (Integer) principal;
        }
        throw new RuntimeException("User not authenticated");
    }
}
