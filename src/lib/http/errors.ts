/** Error thrown for any non-2xx HTTP response. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string | undefined;
  readonly details: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  get isForbidden(): boolean {
    return this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }
}

/** Request never reached the server (offline, DNS, TLS) or timed out. */
export class NetworkError extends Error {
  readonly isTimeout: boolean;

  constructor(message: string, isTimeout = false) {
    super(message);
    this.name = 'NetworkError';
    this.isTimeout = isTimeout;
  }
}

type NestErrorBody = { message?: unknown; error?: unknown; statusCode?: unknown; code?: unknown };

/** Parses the NestJS error shape `{ statusCode, message, error }` (message may be string[]). */
export async function toApiError(res: Response): Promise<ApiError> {
  let body: NestErrorBody | undefined;
  try {
    body = (await res.json()) as NestErrorBody;
  } catch {
    body = undefined;
  }
  const raw = body?.message;
  const message = Array.isArray(raw)
    ? raw.map(String).join('\n')
    : typeof raw === 'string'
      ? raw
      : res.statusText || `Request failed (${res.status})`;
  // A specific `code` (e.g. "machine_inactive") wins over the generic `error` ("Forbidden").
  const code =
    typeof body?.code === 'string'
      ? body.code
      : typeof body?.error === 'string'
        ? body.error
        : undefined;
  return new ApiError(res.status, message, code, body);
}

export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 429 || status >= 500;
}

/** User-facing message for any thrown value. */
export function errorMessage(error: unknown): string {
  if (error instanceof NetworkError) {
    return error.isTimeout ? 'The server took too long to respond.' : 'No connection.';
  }
  if (error instanceof ApiError) {
    if (error.code === 'machine_inactive') {
      return "This machine isn't active. An admin can activate it on the website.";
    }
    if (error.code === 'account_suspended') {
      return 'Your account is suspended for an overdue invoice. Contact your organisation admin.';
    }
    if (error.code === 'feature_not_in_plan') {
      return error.message || "Your organisation's plan doesn't include this feature.";
    }
    if (error.isForbidden) return "You don't have permission to do that.";
    if (error.status >= 500) return 'Something went wrong on our side. Try again.';
    return error.message;
  }
  return 'Something went wrong. Try again.';
}
