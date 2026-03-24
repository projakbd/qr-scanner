const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function authHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.errors?.[0]?.message || err?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function apiRegister(email: string, password: string, fullName?: string) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, passwordConfirmation: password, fullName }),
  });
  return handleResponse<{ data: { token: string; user: { id: number; email: string; fullName: string } } }>(res);
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{ data: { token: string; user: { id: number; email: string; fullName: string } } }>(res);
}

export async function apiLogout() {
  const res = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return res.ok;
}

export async function apiMe() {
  const res = await fetch(`${BASE_URL}/api/v1/account/profile`, { headers: authHeaders() });
  return handleResponse<{ data: { id: number; email: string; fullName: string } }>(res);
}

export async function apiPostScan(barcodeData: string, format: string, deviceInfo?: string) {
  const res = await fetch(`${BASE_URL}/api/v1/scans`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ barcodeData, format, deviceInfo }),
  });
  return handleResponse<{ data: { id: number; barcodeData: string; format: string; createdAt: string } }>(res);
}

export async function apiGetScans() {
  const res = await fetch(`${BASE_URL}/api/v1/scans`, { headers: authHeaders() });
  return handleResponse<{ data: { id: number; barcodeData: string; format: string; createdAt: string }[] }>(res);
}
