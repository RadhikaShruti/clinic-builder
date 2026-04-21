const BASE = '/api';

const getToken = () => localStorage.getItem('token');

const req = async (method, path, body, isFormData = false) => {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
};

export const api = {
  get: (path) => req('GET', path),
  post: (path, body) => req('POST', path, body),
  put: (path, body) => req('PUT', path, body),
  delete: (path) => req('DELETE', path),
  upload: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return req('POST', '/upload', fd, true);
  },
};

export default api;
