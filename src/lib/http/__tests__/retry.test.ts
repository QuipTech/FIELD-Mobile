import { DEFAULT_RETRY, backoffDelay, retryAfterMs } from '../retry';
import { buildUrl } from '../url';

describe('backoff', () => {
  it('grows exponentially and caps at maxDelay', () => {
    const max = () => 1;
    expect(backoffDelay(1, DEFAULT_RETRY, max)).toBe(400);
    expect(backoffDelay(2, DEFAULT_RETRY, max)).toBe(800);
    expect(backoffDelay(10, DEFAULT_RETRY, max)).toBe(5000);
  });

  it('parses Retry-After seconds and dates', () => {
    expect(retryAfterMs('2', 5000)).toBe(2000);
    expect(retryAfterMs('60', 5000)).toBe(5000);
    expect(retryAfterMs(new Date(11_000).toUTCString(), 5000, 10_000)).toBe(1000);
    expect(retryAfterMs(null, 5000)).toBeNull();
  });
});

describe('buildUrl', () => {
  it('encodes values, repeats arrays and skips empties', () => {
    expect(buildUrl('https://a', 'm', { q: 'a b', s: ['x', 'y'], e: '', n: null })).toBe(
      'https://a/m?q=a%20b&s=x&s=y',
    );
  });
});
