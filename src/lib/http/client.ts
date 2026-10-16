import { getToken, notifySessionExpired, refreshToken } from './auth';
import { ApiError, NetworkError, isRetryableStatus, toApiError } from './errors';
import { DEFAULT_RETRY, backoffDelay, retryAfterMs, sleep, type RetryOptions } from './retry';
import { buildUrl, type Query } from './url';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type RequestOptions = {
  method?: HttpMethod;
  query?: Query;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Sent as `Idempotency-Key`; also makes non-idempotent methods safe to retry. */
  idempotencyKey?: string;
  retry?: Partial<RetryOptions> | false;
  /** Attach bearer token (default true). */
  auth?: boolean;
};

export type HttpClientConfig = { baseUrl: string; defaultTimeoutMs?: number };

const SAFE_TO_RETRY: HttpMethod[] = ['GET', 'PUT', 'DELETE'];

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  outer?: AbortSignal,
): Promise<Response> {
  const controller = new AbortController();
  let timedOut = false;
  const onAbort = () => controller.abort();
  outer?.addEventListener('abort', onAbort);
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (outer?.aborted) throw error;
    throw new NetworkError(timedOut ? 'Request timed out' : 'Network request failed', timedOut);
  } finally {
    clearTimeout(timer);
    outer?.removeEventListener('abort', onAbort);
  }
}

function buildInit(opts: RequestOptions, token: string | null): RequestInit {
  const headers: Record<string, string> = { Accept: 'application/json', ...opts.headers };
  let body: BodyInit | undefined;
  if (opts.body instanceof FormData) {
    body = opts.body;
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;
  return { method: opts.method ?? 'GET', headers, body };
}

async function parseBody<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const type = res.headers.get('content-type') ?? '';
  if (type.includes('application/json')) return (await res.json()) as T;
  return (await res.text()) as T;
}

export function createHttpClient(config: HttpClientConfig) {
  const timeoutDefault = config.defaultTimeoutMs ?? 20_000;

  /** One attempt, with a single token refresh on 401. */
  async function send(url: string, opts: RequestOptions): Promise<Response> {
    const useAuth = opts.auth !== false;
    const timeout = opts.timeoutMs ?? timeoutDefault;
    const token = useAuth ? await getToken() : null;
    const res = await fetchWithTimeout(url, buildInit(opts, token), timeout, opts.signal);
    if (res.status !== 401 || !useAuth) return res;

    const fresh = await refreshToken();
    if (!fresh) {
      notifySessionExpired();
      return res;
    }
    const retried = await fetchWithTimeout(url, buildInit(opts, fresh), timeout, opts.signal);
    if (retried.status === 401) notifySessionExpired();
    return retried;
  }

  async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
    const url = buildUrl(config.baseUrl, path, opts.query);
    const method = opts.method ?? 'GET';
    const canRetry =
      opts.retry !== false && (SAFE_TO_RETRY.includes(method) || Boolean(opts.idempotencyKey));
    const retry = { ...DEFAULT_RETRY, ...(opts.retry || {}) };
    const attempts = canRetry ? retry.attempts : 1;

    for (let attempt = 1; ; attempt++) {
      const isLast = attempt >= attempts;
      try {
        const res = await send(url, opts);
        if (res.ok) return await parseBody<T>(res);
        if (isLast || !isRetryableStatus(res.status)) throw await toApiError(res);
        const wait = retryAfterMs(res.headers.get('retry-after'), retry.maxDelayMs);
        await sleep(wait ?? backoffDelay(attempt, retry), opts.signal);
      } catch (error) {
        if (error instanceof ApiError || isLast || !(error instanceof NetworkError)) throw error;
        await sleep(backoffDelay(attempt, retry), opts.signal);
      }
    }
  }

  return {
    request,
    get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...opts, method: 'GET' }),
    post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...opts, method: 'POST', body }),
    put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...opts, method: 'PUT', body }),
    patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...opts, method: 'PATCH', body }),
    delete: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
      request<T>(path, { ...opts, method: 'DELETE' }),
  };
}

export type HttpClient = ReturnType<typeof createHttpClient>;
