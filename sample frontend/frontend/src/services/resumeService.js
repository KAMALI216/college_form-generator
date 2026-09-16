import { sanitizeProfile } from './profileService';
import api from './api';

export const extractResumeInformation = async (file) => {
  try {
    const formData = new FormData();
    formData.append('resumeFile', file);

    console.log('Uploading resume to backend:', file.name);

    const response = await api.post('/resume/extract-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('Profile extraction response:', response.data);

    // The backend returns the exact profile object extracted by Colab
    // Wait, the Colab response has a wrapper:
    // { "profile": { ... } }
    // If the backend returns the Colab response directly as JsonNode, it will be wrapped.
    // Let's check what the backend sends: ResponseEntity.ok(profileJsonNode) which contains {"profile": {...}}.
    // Wait, let's be safe and check if it's nested or direct.
    
    let profileObj = response.data;
    if (profileObj.profile) {
      profileObj = profileObj.profile;
    }

    return sanitizeProfile(profileObj);

  } catch (error) {
    console.error('Error extracting resume information:', error);
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error('Failed to extract resume profile. Please try again.');
  }
};