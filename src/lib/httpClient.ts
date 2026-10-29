import { env } from '@/app/config/env';
import { clearSession, getSession, sessionExpiredEvent } from './session';

/** Normalized error shape every API call throws. `status` is 0 for network failures. */
export class ApiError extends Error {
  readonly status: number;
  /** Stable server error code, e.g. `INSUFFICIENT_STOCK`. */
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readMessage(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
    return data.message;
  }
  return undefined;
}

function readCode(data: unknown): string | undefined {
  if (data && typeof data === 'object' && 'code' in data && typeof data.code === 'string') {
    return data.code;
  }
  return undefined;
}

async function request<T>(
  path: string,
  { method = 'GET', body, signal, headers: extraHeaders }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json', ...extraHeaders };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const token = getSession()?.token;
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${env.apiUrl}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0);
  }

  const data = await parseBody(response);

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearSession();
      window.dispatchEvent(new Event(sessionExpiredEvent));
    }
    throw new ApiError(
      readMessage(data) ?? `Request failed (${response.status})`,
      response.status,
      readCode(data),
    );
  }

  // Response shapes are owned by each feature's API module.
  return data as T;
}

export const httpClient = {
  get: <T>(path: string, signal?: AbortSignal) => request<T>(path, { signal }),
  post: <T>(path: string, body?: unknown, headers?: Record<string, string>) =>
    request<T>(path, { method: 'POST', body, headers }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/** User-safe message for any thrown value. */
export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
) {
  return error instanceof Error && error.message ? error.message : fallback;
}
