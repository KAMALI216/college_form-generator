import api from './api';

export const fetchAutocompleteSuggestions = async (fieldLabel, query, options) => {
  try {
    const response = await api.post('/ai/autocomplete', {
      fieldLabel,
      query,
      options: options || []
    });
    return response.data;
  } catch (error) {
    console.error('Autocomplete AI error:', error);
    return { suggestions: [] };
  }
};

export const fetchSchemaReview = async (title, description, schema) => {
  try {
    const response = await api.post('/ai/review-form-schema', {
      title,
      description,
      schema
    });
    return response.data;
  } catch (error) {
    console.error('Schema Review AI error:', error);
    return { valid: true, issues: [] };
  }
};
