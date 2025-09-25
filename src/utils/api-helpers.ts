import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const e = err as AxiosError<any>;
    const msg =
      typeof e.response?.data === 'object' && e.response?.data !== null
        ? (e.response.data as any).message
        : undefined;
    if (msg) return msg;
    if (e.response?.status) return `Error ${e.response.status}`;
    return e.message;
  }
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

export function withAuth(
  headers?: Record<string, string>
): Record<string, string> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function httpGet<T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await axios.get<T>(`${API_BASE_URL}${endpoint}`, {
    ...(config || {}),
    headers: withAuth(config?.headers as Record<string, string> | undefined),
  });
  return res.data as T;
}

export async function httpPost<T>(
  endpoint: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await axios.post<T>(`${API_BASE_URL}${endpoint}`, body, {
    ...(config || {}),
    headers: withAuth(config?.headers as Record<string, string> | undefined),
  });
  return res.data as T;
}

export async function httpPut<T>(
  endpoint: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await axios.put<T>(`${API_BASE_URL}${endpoint}`, body, {
    ...(config || {}),
    headers: withAuth(config?.headers as Record<string, string> | undefined),
  });
  return res.data as T;
}

export async function httpPatch<T>(
  endpoint: string,
  body?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await axios.patch<T>(`${API_BASE_URL}${endpoint}`, body, {
    ...(config || {}),
    headers: withAuth(config?.headers as Record<string, string> | undefined),
  });
  return res.data as T;
}

export async function httpDelete<T>(
  endpoint: string,
  config?: AxiosRequestConfig
): Promise<T> {
  const res = await axios.delete<T>(`${API_BASE_URL}${endpoint}`, {
    ...(config || {}),
    headers: withAuth(config?.headers as Record<string, string> | undefined),
  });
  return res.data as T;
}

export function retry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 300
): Promise<T> {
  return fn().catch((err) => {
    if (retries <= 0) throw err;
    return new Promise((resolve) => setTimeout(resolve, delayMs)).then(() =>
      retry(fn, retries - 1, delayMs * 2)
    );
  });
}

export function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
