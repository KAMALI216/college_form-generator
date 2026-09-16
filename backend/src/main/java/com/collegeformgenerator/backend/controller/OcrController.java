package com.collegeformgenerator.backend.controller;

import com.collegeformgenerator.backend.exception.ApiException;
import com.collegeformgenerator.backend.service.LlmService;
import com.collegeformgenerator.backend.service.OcrService;
import com.collegeformgenerator.backend.service.StructurerService;
import com.collegeformgenerator.backend.util.PdfToImageConverter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
public class OcrController {

    private static final Logger logger = LoggerFactory.getLogger(OcrController.class);

    private static final List<String> ALLOWED_EXTENSIONS =
            Arrays.asList("pdf", "jpg", "jpeg", "png");

    @org.springframework.beans.factory.annotation.Value("${app.upload-dir}")
    private String uploadDir;

    private final OcrService ocrService;
    private final LlmService llmService;
    private final StructurerService structurerService;
    private final ObjectMapper objectMapper;

    public OcrController(OcrService ocrService,
                         LlmService llmService,
                         StructurerService structurerService,
                         ObjectMapper objectMapper) {
        this.ocrService = ocrService;
        this.llmService = llmService;
        this.structurerService = structurerService;
        this.objectMapper = objectMapper;
    }

    /**
     * OCR only
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadForm(
            @RequestParam("formFile") MultipartFile formFile) {

        if (formFile.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        String originalFilename = formFile.getOriginalFilename();

        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid file name");
        }

        String extension = originalFilename
                .substring(originalFilename.lastIndexOf(".") + 1)
                .toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid file extension. Allowed: pdf, jpg, jpeg, png"
            );
        }

        try {
            logger.info("Current Working Directory: {}", Paths.get("").toAbsolutePath());
            
            Path uploadPath = Paths.get(uploadDir);
            logger.info("Upload Directory: {}", uploadDir);
            logger.info("Original Filename: {}", originalFilename);
            
            boolean existsBefore = Files.exists(uploadPath);
            logger.info("Uploads folder exists: {}", existsBefore);

            if (!existsBefore) {
                Files.createDirectories(uploadPath);
                logger.info("Upload folder was created: true");
            } else {
                logger.info("Upload folder was created: false");
            }

            Path filePath = uploadPath.resolve(
                    System.currentTimeMillis() + "_" + originalFilename
            );
            
            logger.info("Absolute Upload Path: {}", filePath.toAbsolutePath());

            formFile.transferTo(filePath.toFile());

            List<String> imagePaths;

            if ("pdf".equals(extension)) {

                logger.info("PDF detected. Trying native text extraction...");
                String nativeText = PdfToImageConverter.extractNativeText(filePath.toString());
                
                if (PdfToImageConverter.hasUsableText(nativeText)) {
                    logger.info("Using native PDF text layer - skipping OCR");
                    return ResponseEntity.ok(
                            Map.of(
                                    "message", "OCR complete",
                                    "extractedText", nativeText
                            )
                    );
                }

                logger.info("No native text layer found - falling back to OCR");
                logger.info("Converting to images...");

                imagePaths = PdfToImageConverter.convertPdfToImages(
                        filePath.toString(),
                        uploadDir
                );

                logger.info("Generated {} images", imagePaths.size());

            } else {

                imagePaths = Collections.singletonList(
                        filePath.toAbsolutePath().toString()
                );

            }

            logger.info("Running OCR...");

            String extractedText = ocrService.extractText(imagePaths);

            logger.info("OCR completed.");

            return ResponseEntity.ok(
                    Map.of(
                            "message", "OCR complete",
                            "extractedText", extractedText
                    )
            );

        } catch (IOException e) {
            e.printStackTrace();
            throw new ApiException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to save file : " + e.getMessage()
            );
        }
    }

    /**
     * Generate JSON schema from OCR text
     */
    @PostMapping("/generate-schema")
    public ResponseEntity<Map<String, Object>> generateSchema(
            @RequestBody Map<String, String> request) {

        String extractedText = request.get("extractedText");

        if (extractedText == null || extractedText.trim().isEmpty()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "extractedText is required"
            );
        }

        try {

            String schemaString =
                    llmService.generateSchema(extractedText);

            return ResponseEntity.ok(
                    Map.of(
                            "formSchema",
                            objectMapper.readTree(schemaString)
                    )
            );

        } catch (ApiException e) {

            throw e;

        } catch (Exception e) {

            throw new ApiException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to parse generated schema: " + e.getMessage()
            );
        }

    }

    /**
     * Generate JSON schema from Natural Language Description
     */
    @PostMapping("/generate-from-text")
    public ResponseEntity<Map<String, Object>> generateSchemaFromText(
            @RequestBody Map<String, String> request) {

        String description = request.get("description");

        if (description == null || description.trim().isEmpty()) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "description is required"
            );
        }

        try {
            // Build the prompt as requested, but enforcing the FLAT array structure required by the app
            String prompt = "You are a college form generation assistant.\n\n" +
                    "The administrator will describe a form in natural language.\n" +
                    "Convert the description into a structured college form JSON schema.\n\n" +
                    "CRITICAL: You MUST output a FLAT JSON ARRAY of fields. Do NOT output a nested object. " +
                    "To represent sections, insert a field with 'type': 'heading' and the section name as the 'label' before the fields of that section.\n\n" +
                    "Identify:\n" +
                    "* meaningful sections (as heading type fields)\n" +
                    "* actual input fields\n" +
                    "* appropriate field types (e.g., text, email, tel, number, date, radio, checkbox, dropdown, textarea, file)\n" +
                    "* required/optional fields (required: true/false)\n" +
                    "* options for radio/dropdown/checkbox fields (as an array of strings)\n" +
                    "* document upload fields where requested (type: file)\n\n" +
                    "Do not generate explanations.\n" +
                    "Return ONLY a valid JSON array.\n" +
                    "Do not convert section headings or descriptive text into input fields, use the 'heading' type.\n\n" +
                    "ADMIN DESCRIPTION:\n" + description;

            String schemaString = llmService.generateSchema(prompt);

            return ResponseEntity.ok(
                    Map.of(
                            "formSchema",
                            objectMapper.readTree(schemaString)
                    )
            );

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to parse generated schema: " + e.getMessage()
            );
        }
    }   // <-- THIS BRACE WAS MISSING

    /**
     * OCR + LLM in one API
     */
    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processForm(
            @RequestParam("formFile") MultipartFile formFile) {

        long startTime = System.currentTimeMillis();
        logger.info("Stage: Uploading");

        if (formFile.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "File is empty");
        }

        String originalFilename = formFile.getOriginalFilename();

        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid file name"
            );
        }

        String extension = originalFilename
                .substring(originalFilename.lastIndexOf(".") + 1)
                .toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid file extension. Allowed: pdf, jpg, jpeg, png"
            );
        }

        try {
            logger.info("Stage: Saving");

            Path uploadPath = Paths.get(uploadDir);

            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            Path filePath = uploadPath.resolve(
                    System.currentTimeMillis() + "_" + originalFilename
            );

            formFile.transferTo(filePath.toFile());

            List<String> imagePaths = null;
            List<String> pagesText = null;

            logger.info("Stage: Converting");
            if ("pdf".equals(extension)) {

                logger.info("PDF detected. Trying native text extraction...");
                String nativeText = PdfToImageConverter.extractNativeText(filePath.toString());
                
                if (PdfToImageConverter.hasUsableText(nativeText)) {
                    logger.info("Using native PDF text layer - skipping OCR");
                    pagesText = PdfToImageConverter.extractNativeTextPerPage(filePath.toString());
                } else {
                    logger.info("No native text layer found - falling back to OCR");
                    logger.info("Converting to images...");

                    imagePaths = PdfToImageConverter.convertPdfToImages(
                            filePath.toString(),
                            uploadDir
                    );
                }

            } else {

                imagePaths = Collections.singletonList(
                        filePath.toAbsolutePath().toString()
                );
            }

            if (pagesText == null) {
                logger.info("Stage: OCR");
                pagesText = ocrService.extractTextPerPage(imagePaths);
            } else {
                logger.info("Stage: OCR (Skipped, using native text)");
            }
            
            String extractedText = String.join("\n", pagesText);

            logger.info("Stage: Gemini");

            List<Object> combinedSchema = new java.util.ArrayList<>();

            for (int i = 0; i < pagesText.size(); i++) {
                String pageText = pagesText.get(i);
                try {
                    logger.info("Processing page {} with LLM", i + 1);
                    String schemaString = llmService.generateSchema(pageText);
                    com.fasterxml.jackson.databind.JsonNode pageNode = objectMapper.readTree(schemaString);
                    if (pageNode.isArray()) {
                        for (com.fasterxml.jackson.databind.JsonNode element : pageNode) {
                            combinedSchema.add(objectMapper.convertValue(element, Object.class));
                        }
                    } else {
                        logger.warn("LLM returned non-array JSON for page {}", i + 1);
                    }
                } catch (Exception e) {
                    logger.warn("Failed to process schema for page {}: {}", i + 1, e.getMessage());
                    // Continue to next page
                }
            }

            logger.info("Stage: Structuring Schema");
            List<Object> structuredSchema = structurerService.structureSchema(extractedText, combinedSchema);

            long executionTime = System.currentTimeMillis() - startTime;
            logger.info("Stage: Response");
            logger.info("Execution time: {} ms", executionTime);

            return ResponseEntity.ok(
                    Map.of(
                            "extractedText", extractedText,
                            "formSchema", structuredSchema
                    )
            );

        } catch (ApiException e) {
            throw e;
        } catch (IOException e) {
            e.printStackTrace();
            throw new ApiException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to save/convert file: " + e.getMessage()
            );
        } catch (Exception e) {
            e.printStackTrace();
            throw new ApiException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Processing failed: " + e.getMessage()
            );
        }
    }
}