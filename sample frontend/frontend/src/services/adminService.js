import api from './api';

export async function getAdminStats() {
  const { data } = await api.get('/admin/stats');
  return data;
}

export async function getAdminSubmissions() {
  const { data } = await api.get('/submissions/admin');
  return data;
}
