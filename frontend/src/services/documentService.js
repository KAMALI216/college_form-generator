import api from './api';

export const getMyDocuments = async () => {
  try {
    const { data } = await api.get('/documents');
    return data;
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return [];
  }
};

export const uploadDocument = async (documentType, file) => {
  try {
    const formData = new FormData();
    formData.append('documentType', documentType);
    formData.append('file', file);
    
    const { data } = await api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    console.error('Failed to upload document:', error);
    throw error;
  }
};

export const deleteDocument = async (id) => {
  try {
    await api.delete(`/documents/${id}`);
    return true;
  } catch (error) {
    console.error('Failed to delete document:', error);
    throw error;
  }
};
