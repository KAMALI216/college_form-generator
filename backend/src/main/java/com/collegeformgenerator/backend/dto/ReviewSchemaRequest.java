package com.collegeformgenerator.backend.dto;

import java.util.List;
import java.util.Map;

public class ReviewSchemaRequest {
    private String title;
    private String description;
    private List<Map<String, Object>> schema;

    public ReviewSchemaRequest() {}

    public ReviewSchemaRequest(String title, String description, List<Map<String, Object>> schema) {
        this.title = title;
        this.description = description;
        this.schema = schema;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<Map<String, Object>> getSchema() {
        return schema;
    }

    public void setSchema(List<Map<String, Object>> schema) {
        this.schema = schema;
    }
}
