import { setTokenProvider } from '../auth';
import { createHttpClient } from '../client';

/** Minimal XMLHttpRequest that answers every request with `reply`. */
class FakeXhr {
  static last: FakeXhr | undefined;
  static reply = { status: 201, body: '{"photo":{"id":"p1"}}', network: false };
  method = '';
  url = '';
  headers: Record<string, string> = {};
  body: unknown;
  status = 0;
  responseText = '';
  onload?: () => void;
  onerror?: () => void;
  onabort?: () => void;
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  setRequestHeader(key: string, value: string) {
    this.headers[key] = value;
  }
  getAllResponseHeaders() {
    return 'content-type: application/json\r\n';
  }
  abort() {
    this.onabort?.();
  }
  send(body: unknown) {
    this.body = body;
    FakeXhr.last = this;
    if (FakeXhr.reply.network) return this.onerror?.();
    this.status = FakeXhr.reply.status;
    this.responseText = FakeXhr.reply.body;
    this.onload?.();
  }
}

const fetchMock = jest.fn();
const client = createHttpClient({ baseUrl: 'https://api.test' });

beforeEach(() => {
  FakeXhr.reply = { status: 201, body: '{"photo":{"id":"p1"}}', network: false };
  globalThis.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;
  globalThis.fetch = fetchMock;
  fetchMock.mockReset();
  setTokenProvider({
    getToken: async () => 'tok',
    refreshToken: async () => null,
    onSessionExpired: jest.fn(),
  });
});

describe('multipart uploads', () => {
  it('go over XMLHttpRequest, not fetch, with auth and the file part', async () => {
    const form = new FormData();
    form.append('file', {
      uri: 'file:///photo.jpg',
      name: 'photo-1.jpg',
      type: 'image/jpeg',
    } as never);

    await expect(
      client.post('/machines/m/history/e/photos', form, { idempotencyKey: 'key-123' }),
    ).resolves.toEqual({ photo: { id: 'p1' } });
    expect(fetchMock).not.toHaveBeenCalled();
    const xhr = FakeXhr.last!;
    expect([xhr.method, xhr.url]).toEqual(['POST', 'https://api.test/machines/m/history/e/photos']);
    expect(xhr.headers).toMatchObject({
      Authorization: 'Bearer tok',
      'Idempotency-Key': 'key-123',
    });
    expect(xhr.body).toBe(form);
  });

  it('turn server refusals into ApiErrors with the server message', async () => {
    FakeXhr.reply = {
      status: 413,
      body: '{"statusCode":413,"message":"File too large","error":"Payload Too Large"}',
      network: false,
    };
    await expect(client.post('/p', new FormData(), { retry: false })).rejects.toMatchObject({
      status: 413,
      message: 'File too large',
    });
  });

  it('report a dropped connection as a network error', async () => {
    FakeXhr.reply = { status: 0, body: '', network: true };
    await expect(client.post('/p', new FormData(), { retry: false })).rejects.toMatchObject({
      name: 'NetworkError',
    });
  });

  it('leave JSON requests on fetch', async () => {
    fetchMock.mockResolvedValueOnce(
      new Response('{"id":"e1"}', { status: 201, headers: { 'content-type': 'application/json' } }),
    );
    await client.post('/machines/m/history', { entryType: 'repair' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
