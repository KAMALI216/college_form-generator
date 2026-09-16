const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function requestJson(path, body) {
  const url = `${API_BASE_URL}${path}`;
  console.info('[authApi] POST', url);
  console.info('[authApi] request body', JSON.stringify(body));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  console.info('[authApi] response status', response.status);
  console.info('[authApi] response body', payload);

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

export function signupUser(payload) {
  return requestJson('/auth/signup', payload);
}

export function loginUser(payload) {
  return requestJson('/auth/login', payload);
}
