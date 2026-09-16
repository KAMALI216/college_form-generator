import api from './api';

export async function submitForm(payload) {
  const { data } = await api.post('/submissions', payload);
  return data;
}

export async function getMyStats() {
  const { data } = await api.get('/submissions/my-stats');
  return data;
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