package com.collegeformgenerator.backend.util;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.ImageType;
import org.apache.pdfbox.rendering.PDFRenderer;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

public class PdfToImageConverter {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(PdfToImageConverter.class);

    public static List<String> convertPdfToImages(String pdfPath, String uploadDirPath) throws IOException {
        List<String> imagePaths = new ArrayList<>();
        File file = new File(pdfPath);
        
        try (PDDocument document = Loader.loadPDF(file)) {
            PDFRenderer pdfRenderer = new PDFRenderer(document);
            int numberOfPages = document.getNumberOfPages();
            
            logger.info("Number of pages: {}", numberOfPages);

            String originalName = file.getName();
            if (originalName.toLowerCase().endsWith(".pdf")) {
                originalName = originalName.substring(0, originalName.length() - 4);
            }

            Path uploadDir = Paths.get(uploadDirPath);

            for (int page = 0; page < numberOfPages; ++page) {
                BufferedImage bim = pdfRenderer.renderImageWithDPI(page, 300, ImageType.RGB);
                String imageName = originalName + "-page-" + (page + 1) + ".png";
                File outputfile = uploadDir.resolve(imageName).toFile();
                
                ImageIO.write(bim, "png", outputfile);
                
                logger.info("Generated image name: {}", imageName);
                logger.info("Absolute image path: {}", outputfile.getAbsolutePath());
                
                imagePaths.add(outputfile.getAbsolutePath());
            }
        } catch (Exception e) {
            logger.error("PDFBox Exception during conversion: {}", e.getMessage());
            throw new IOException("PDFBox Exception: " + e.getMessage(), e);
        }
        return imagePaths;
    }

    public static String extractNativeText(String pdfPath) throws IOException {
        try (PDDocument document = Loader.loadPDF(new File(pdfPath))) {
            org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
            return stripper.getText(document);
        }
    }

    public static boolean hasUsableText(String extractedText) {
        if (extractedText == null) return false;
        String trimmed = extractedText.trim();
        // Require a reasonable minimum length to count as "usable" - a scanned PDF with 
        // no text layer typically returns empty string or just a few stray characters.
        return trimmed.length() > 20;
    }

    public static List<String> extractNativeTextPerPage(String pdfPath) throws IOException {
        List<String> pagesText = new ArrayList<>();
        try (PDDocument document = Loader.loadPDF(new File(pdfPath))) {
            org.apache.pdfbox.text.PDFTextStripper stripper = new org.apache.pdfbox.text.PDFTextStripper();
            int numberOfPages = document.getNumberOfPages();
            for (int pageNum = 1; pageNum <= numberOfPages; pageNum++) {
                stripper.setStartPage(pageNum);
                stripper.setEndPage(pageNum);
                pagesText.add(stripper.getText(document));
            }
        }
        return pagesText;
    }
}
