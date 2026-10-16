export type RetryOptions = {
  /** Total attempts including the first. */
  attempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
};

export const DEFAULT_RETRY: RetryOptions = { attempts: 3, baseDelayMs: 400, maxDelayMs: 5000 };

/** Full-jitter exponential backoff. `attempt` is 1-based (delay before attempt n+1). */
export function backoffDelay(attempt: number, opts: RetryOptions, random = Math.random): number {
  const ceiling = Math.min(opts.maxDelayMs, opts.baseDelayMs * 2 ** (attempt - 1));
  return Math.round(random() * ceiling);
}

/** Retry-After header in seconds or HTTP-date → ms, capped. */
export function retryAfterMs(header: string | null, cap: number, now = Date.now()): number | null {
  if (!header) return null;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return Math.min(cap, Math.max(0, seconds * 1000));
  const date = Date.parse(header);
  return Number.isNaN(date) ? null : Math.min(cap, Math.max(0, date - now));
}

export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error('Aborted'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('Aborted'));
    });
  });
}
