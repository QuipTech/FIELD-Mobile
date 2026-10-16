import { setTokenProvider } from '../auth';
import { createHttpClient } from '../client';
import { ApiError, NetworkError } from '../errors';

const BASE = 'https://api.test';
const json = (status: number, body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...headers },
  });

const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>();
const client = createHttpClient({ baseUrl: BASE });
const noRetryDelay = { baseDelayMs: 0, maxDelayMs: 0 };

beforeEach(() => {
  fetchMock.mockReset();
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  setTokenProvider(null);
});

describe('http client', () => {
  it('builds URL with query and attaches bearer token', async () => {
    setTokenProvider({
      getToken: async () => 'tok',
      refreshToken: async () => null,
      onSessionExpired: jest.fn(),
    });
    fetchMock.mockResolvedValueOnce(json(200, { ok: true }));
    await expect(
      client.get('/machines', { query: { q: 'cat', site: undefined } }),
    ).resolves.toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASE}/machines?q=cat`);
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok');
  });

  it('refreshes once on 401 and retries with the new token', async () => {
    const onSessionExpired = jest.fn();
    setTokenProvider({
      getToken: async () => 'old',
      refreshToken: async () => 'new',
      onSessionExpired,
    });
    fetchMock.mockResolvedValueOnce(json(401, {})).mockResolvedValueOnce(json(200, [1]));
    await expect(client.get('/x')).resolves.toEqual([1]);
    expect((fetchMock.mock.calls[1]![1].headers as Record<string, string>).Authorization).toBe(
      'Bearer new',
    );
    expect(onSessionExpired).not.toHaveBeenCalled();
  });

  it('signals session expiry when refresh fails', async () => {
    const onSessionExpired = jest.fn();
    setTokenProvider({
      getToken: async () => 'old',
      refreshToken: async () => null,
      onSessionExpired,
    });
    fetchMock.mockResolvedValueOnce(json(401, { message: 'Unauthorized', statusCode: 401 }));
    await expect(client.get('/x')).rejects.toBeInstanceOf(ApiError);
    expect(onSessionExpired).toHaveBeenCalledTimes(1);
  });

  it('retries GET on 503 then succeeds', async () => {
    fetchMock.mockResolvedValueOnce(json(503, {})).mockResolvedValueOnce(json(200, 'ok'));
    await expect(client.get('/x', { retry: noRetryDelay })).resolves.toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry POST without an idempotency key', async () => {
    fetchMock.mockResolvedValue(json(503, {}));
    await expect(client.post('/x', {}, { retry: noRetryDelay })).rejects.toMatchObject({
      status: 503,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries POST with an idempotency key and sends the header', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('Network request failed'))
      .mockResolvedValueOnce(json(201, { id: 1 }));
    await expect(
      client.post('/x', { a: 1 }, { idempotencyKey: 'k1', retry: noRetryDelay }),
    ).resolves.toEqual({ id: 1 });
    expect((fetchMock.mock.calls[1]![1].headers as Record<string, string>)['Idempotency-Key']).toBe(
      'k1',
    );
  });

  it('does not retry 4xx and parses NestJS array messages', async () => {
    fetchMock.mockResolvedValue(
      json(400, {
        statusCode: 400,
        message: ['a is required', 'b too long'],
        error: 'Bad Request',
      }),
    );
    const err = await client.get('/x').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).message).toBe('a is required\nb too long');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws NetworkError after exhausting retries', async () => {
    fetchMock.mockRejectedValue(new TypeError('Network request failed'));
    await expect(client.get('/x', { retry: noRetryDelay })).rejects.toBeInstanceOf(NetworkError);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
