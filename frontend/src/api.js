const getApiUrl = () => import.meta.env.VITE_API_URL ?? '';

async function request(path, options = {}) {
  const base = getApiUrl().replace(/\/$/, '');
  const url = base ? `${base}/${path.replace(/^\//, '')}` : path;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  return data;
}

export { getApiUrl };

export const api = {
  login(username, password) {
    return request('api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
  getDashboardStats() {
    return request('api/dashboard');
  },
  importSave(rows) {
    return request('api/import_save', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    });
  },
  importList() {
    return request('api/import_list');
  },
  notificationsSend(rows) {
    return request('api/notifications_send', {
      method: 'POST',
      body: JSON.stringify({ rows }),
    });
  },
  notificationsList() {
    return request('api/notifications_list');
  },
};
