export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api';

export async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) }, cache: 'no-store' });
  if (!res.ok) throw new Error(`Request failed ${res.status}`);
  const body = await res.json();
  return body.data as T;
}


