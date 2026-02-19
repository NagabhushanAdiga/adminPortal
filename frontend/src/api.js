// Backend API base URL (no trailing slash). Set VITE_API_URL in .env and in Vercel for frontend deployment.
const BACKEND_URL = 'https://admin-portal-ivory-psi.vercel.app';

const getApiUrl = () => {
  const env = (import.meta.env.VITE_API_URL ?? '').toString().trim();
  if (env) return env.replace(/\/$/, '');
  if (import.meta.env.PROD) return BACKEND_URL;
  return '';
};

async function request(path, options = {}) {
  const base = getApiUrl().replace(/\/$/, '');
  const url = base ? `${base}/${path.replace(/^\//, '')}` : path;
  let res;
  try {
    res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (err) {
    throw new Error(err.message || 'Cannot reach server. Check URL and network.');
  }
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : {};
  if (!res.ok) {
    const msg = data.error || data.message || (data.details && String(data.details)) || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

export { getApiUrl };

export const api = {
  /** Check backend health (MongoDB connected) */
  async health() {
    return request('api/health');
  },

  /** Create default admin (admin / admin123). Call once if needed. */
  async setup() {
    return request('api/setup');
  },

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

  usersList() {
    return request('api/users');
  },
};
