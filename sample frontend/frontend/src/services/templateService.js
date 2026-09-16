import api from './api';

export async function createTemplate(payload) {
  const { data } = await api.post('/templates', payload);
  return data;
}

export async function getTemplates() {
  const { data } = await api.get('/templates');
  return data;
}

export async function getTemplateById(id) {
  const { data } = await api.get(`/templates/${id}`);
  return data;
}

export async function deleteTemplate(id) {
  const { data } = await api.delete(`/templates/${id}`);
  return data;
}

export async function duplicateTemplate(id) {
  const { data } = await api.post(`/templates/${id}/duplicate`);
  return data;
}

export async function getAdminTemplates() {
  const { data } = await api.get('/templates/admin');
  return data;
}

export async function approveTemplate(id) {
  const { data } = await api.post(`/templates/${id}/approve`);
  return data;
}

export async function updateTemplate(id, payload) {
  const { data } = await api.put(`/templates/${id}`, payload);
  return data;
}