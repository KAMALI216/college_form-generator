import api from './api';

function normalizeError(error, fallbackMessage) {
  const message = error?.response?.data?.message || fallbackMessage;
  const normalized = new Error(message);
  normalized.status = error?.response?.status;
  return normalized;
}

export async function userRegister(payload) {
  try {
    const { data } = await api.post('/auth/signup', {
      fullName: payload.full_name,
      email: payload.email,
      password: payload.password,
      role: 'USER',
    });
    return data;
  } catch (error) {
    throw normalizeError(error, 'Registration failed');
  }
}

export async function userLogin(payload) {
  try {
    const { data } = await api.post('/auth/login', {
      email: payload.email,
      password: payload.password,
      role: 'USER',
    });
    return data;
  } catch (error) {
    throw normalizeError(error, 'Login failed');
  }
}