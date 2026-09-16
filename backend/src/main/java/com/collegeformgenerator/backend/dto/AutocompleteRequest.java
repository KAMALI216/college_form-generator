package com.collegeformgenerator.backend.dto;

import java.util.List;

public class AutocompleteRequest {
    private String fieldLabel;
    private String query;
    private List<String> options;

    public AutocompleteRequest() {}

    public AutocompleteRequest(String fieldLabel, String query, List<String> options) {
        this.fieldLabel = fieldLabel;
        this.query = query;
        this.options = options;
    }

    public String getFieldLabel() {
        return fieldLabel;
    }

    public void setFieldLabel(String fieldLabel) {
        this.fieldLabel = fieldLabel;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }

    public List<String> getOptions() {
        return options;
    }

    public void setOptions(List<String> options) {
        this.options = options;
    }
}
