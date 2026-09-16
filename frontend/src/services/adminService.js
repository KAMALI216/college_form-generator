import api from './api';

export async function getAdminStats() {
  const { data } = await api.get('/admin/stats');
  return data;
}

export async function getAdminSubmissions() {
  const { data } = await api.get('/submissions/admin');
  return data;
}

export async function getSubmissionById(id) {
  const { data } = await api.get(`/submissions/${id}`);
  return data;
}

export async function updateSubmissionStatus(id, status, adminComment = '') {
  const { data } = await api.put(`/submissions/${id}/status`, { status, adminComment });
  return data;
}

export async function exportFormSubmissions(formId) {
  const response = await api.get(`/admin/forms/${formId}/export`, {
    responseType: 'blob'
  });
  return response;
}
