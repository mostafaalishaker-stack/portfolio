const API_BASE = '/api';

export async function apiClient<T = unknown>(path: string, opts?: RequestInit): Promise<T> {
  const token = localStorage.getItem('saas_token');
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...opts?.headers,
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `Request failed with status ${res.status}`);
    return data as T;
  } catch (err) {
    console.error(`API error [${path}]:`, err);
    throw err;
  }
}
