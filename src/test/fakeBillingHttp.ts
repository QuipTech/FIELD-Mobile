import { ApiError } from '@/lib/http/errors';

/**
 * A fake FIELD API for billing screens, by method and path. Tests swap answers to move the
 * server's state on, and read `billingCalls` to see what was sent. Install with:
 * `jest.mock('@/lib/http', () => ({ ...jest.requireActual('@/lib/http'), http: jest.requireActual('@/test/fakeBillingHttp').fakeHttp }))`.
 */

type Answer = unknown | (() => unknown);
export const billingApi: Record<string, Answer> = {};
export const billingCalls: { method: string; path: string; body?: unknown }[] = [];

function answer(method: string, path: string, body?: unknown) {
  billingCalls.push(body === undefined ? { method, path } : { method, path, body });
  const a = billingApi[`${method} ${path}`];
  if (a === undefined) return Promise.reject(new ApiError(404, `No fake for ${method} ${path}`));
  try {
    return Promise.resolve(typeof a === 'function' ? (a as () => unknown)() : a);
  } catch (error) {
    return Promise.reject(error);
  }
}

export const fakeHttp = {
  get: (path: string) => answer('GET', path),
  post: (path: string, body?: unknown) => answer('POST', path, body),
  put: (path: string, body?: unknown) => answer('PUT', path, body),
  delete: (path: string) => answer('DELETE', path),
};

/** Clears answers and calls, then sets what every billing screen reads. */
export function resetBillingApi() {
  for (const key of Object.keys(billingApi)) delete billingApi[key];
  billingCalls.length = 0;
  billingApi['GET /me/billing/invoices'] = [];
  billingApi['GET /organisation/subscription'] = { planName: 'Asset Pro', status: 'active' };
  billingApi['POST /me/billing/payment/check'] = {};
}
