import api from './api';

export async function submitForm(payload) {
  const { data } = await api.post('/submissions', payload);
  return data;
}

export async function getMyStats() {
  try {
    const { data } = await api.get('/submissions/my-stats');
    return data;
  } catch (error) {
    console.error('Failed to fetch submission stats:', error);
    return { total: 0, pending: 0, approved: 0, correction: 0 };
  }
}

export async function getMySubmissions() {
  try {
    const { data } = await api.get('/submissions/my');
    return data;
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    return [];
  }
}