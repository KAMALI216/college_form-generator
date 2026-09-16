import api from './api';

export const getProfile = async () => {
  try {
    const { data } = await api.get('/student-profiles/me');
    return data;
  } catch (error) {
    console.error('Failed to fetch student profile:', error);
    return null;
  }
};

export const updateProfileAPI = async (profileData) => {
  try {
    const { data } = await api.put('/student-profiles/me', profileData);
    return data;
  } catch (error) {
    console.error('Failed to update student profile:', error);
    throw error;
  }
};

