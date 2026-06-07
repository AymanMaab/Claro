const BASE = '/api';

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export function post<T>(path: string, body: unknown, options?: RequestInit): Promise<T> {
  return http<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
    ...options,
  });
}
