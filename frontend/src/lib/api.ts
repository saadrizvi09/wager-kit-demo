const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('wk_token');
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return res;
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Login failed' }));
    throw new Error(err.message || 'Login failed');
  }

  const data = await res.json();
  localStorage.setItem('wk_token', data.access_token);
  localStorage.setItem('wk_user', JSON.stringify(data.user));
  // Set cookie for middleware
  document.cookie = `wk_auth=${data.access_token}; path=/; max-age=86400`;
  return data;
}

export function logout() {
  localStorage.removeItem('wk_token');
  localStorage.removeItem('wk_user');
  document.cookie = 'wk_auth=; path=/; max-age=0';
  window.location.href = '/login';
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('wk_user');
  return raw ? JSON.parse(raw) : null;
}

export async function getMarkets() {
  const res = await apiFetch('/markets');
  return res.json();
}

export async function searchMarkets(query: string) {
  const res = await apiFetch(`/markets?q=${encodeURIComponent(query)}`);
  return res.json();
}

export async function searchMarketDetail(query: string) {
  const res = await apiFetch('/markets/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  return res.json();
}

export async function getMarketDetail(slug: string) {
  const res = await apiFetch(`/markets/${slug}`);
  return res.json();
}

export async function exportOddsCsv(slug: string) {
  const res = await fetch(`${API_URL}/markets/${slug}/export/odds-csv`);
  return res.text();
}

export async function exportIntegrityCsv(slug: string) {
  const res = await fetch(`${API_URL}/markets/${slug}/export/integrity-csv`);
  return res.text();
}

export async function exportDossierJson(slug: string) {
  const res = await fetch(`${API_URL}/markets/${slug}/export/dossier-json`);
  return res.json();
}

export async function refreshMarket(slug: string) {
  const res = await apiFetch(`/markets/${slug}/refresh`, { method: 'POST' });
  return res.json();
}

export async function getJobsStatus() {
  const res = await apiFetch('/markets/jobs/status');
  return res.json();
}
