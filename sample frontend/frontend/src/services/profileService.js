import api from './api';

export const getProfile = async () => {
  try {
    const { data } = await api.get('/profile');
    return data;
  } catch (error) {
    console.error('Failed to fetch student profile:', error);
    return null;
  }
};

export const updateProfile = async (updates) => {
  try {
    const { data } = await api.put('/profile', updates);
    return data;
  } catch (error) {
    console.error('Failed to update student profile:', error);
    throw error;
  }
};

export const sanitizeProfile = (profile) => {
  if (!profile) return {};
  
  return {
    ...profile,
    skills: profile.skills || [],
    education: profile.education || [],
    experience: profile.experience || [],
    projects: profile.projects || []
  };
};

export const isProfileCompleted = (profile) => {
  if (!profile) return false;
  
  // Basic validation to check if essential profile info is filled out
  const hasBasicInfo = !!(profile.firstName || profile.name);
  const hasContactInfo = !!profile.email;
  const hasEducation = profile.education && profile.education.length > 0;
  
  // A profile is "completed" if they have at least their name/email and one education entry, 
  // adjust this logic based on your strict business requirements.
  return hasBasicInfo && hasContactInfo && hasEducation;
};
