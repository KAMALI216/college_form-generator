package com.collegeformgenerator.backend.service;

import com.collegeformgenerator.backend.exception.ApiException;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.List;

@Service
public class OcrService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(OcrService.class);

    @Value("${tesseract.datapath}")
    private String tesseractDatapath;

    public List<String> extractTextPerPage(List<String> imagePaths) {
        logger.info("Starting OCR...");
        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath(tesseractDatapath);
        
        List<String> pagesText = new java.util.ArrayList<>();

        try {
            for (int i = 0; i < imagePaths.size(); i++) {
                logger.info("OCR on page {}", (i + 1));
                String imagePath = imagePaths.get(i);
                String result = tesseract.doOCR(new File(imagePath));
                pagesText.add(result);
            }
            logger.info("OCR Completed");
            return pagesText;
        } catch (TesseractException e) {
            logger.error("TesseractException: {}", e.getMessage());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "TesseractException: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected exception during OCR: {}", e.getMessage());
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "OCR processing failed: " + e.getMessage());
        }
    }

    public String extractText(List<String> imagePaths) {
        List<String> pages = extractTextPerPage(imagePaths);
        return String.join("\n", pages);
    }
}
