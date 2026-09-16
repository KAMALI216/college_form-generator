import api from './api';

function statusFallback(status, fallbackMessage) {
  if (status === 400) return 'Bad Request: Please verify input fields';
  if (status === 401) return 'Unauthorized: Invalid credentials';
  if (status === 403) return 'Forbidden: Access denied for selected role';
  if (status === 404) return 'Not Found: API endpoint does not exist';
  if (status === 500) return 'Server Error: Please try again later';
  return fallbackMessage;
}

function normalizeError(error, fallbackMessage) {
  const status = error?.response?.status;
  const serverMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.details ||
    '';

  const normalized = new Error(serverMessage || statusFallback(status, fallbackMessage));
  normalized.status = status;
  normalized.serverMessage = serverMessage;
  return normalized;
}

export async function login(payload) {
  try {
    const { data } = await api.post('/auth/login', payload);
    return data;
  } catch (error) {
    throw normalizeError(error, 'Login failed');
  }
}

export async function register(payload) {
  try {
    const { data } = await api.post('/auth/signup', { ...payload, role: 'USER' });
    return data;
  } catch (error) {
    throw normalizeError(error, 'Registration failed');
  }
}

export async function registerAdmin(payload) {
  try {
    const { data } = await api.post('/auth/register-admin', payload);
    return data;
  } catch (error) {
    throw normalizeError(error, 'Admin registration failed');
  }
}

export async function forgotPassword(payload) {
  try {
    // TODO: Confirm endpoint path with backend when forgot-password API is implemented.
    const { data } = await api.post('/auth/forgot-password', payload);
    return data;
  } catch (error) {
    if (error?.response?.status === 404) {
      const notAvailableError = new Error(
        'Forgot Password endpoint is not available yet. Please contact administrator.'
      );
      notAvailableError.status = 404;
      throw notAvailableError;
    }

    throw normalizeError(error, 'Forgot password request failed');
  }
}
