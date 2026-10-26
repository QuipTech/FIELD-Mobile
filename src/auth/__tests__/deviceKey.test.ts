import { ed25519 } from '@noble/curves/ed25519.js';

import { ApiError } from '@/lib/http';
import { challengeMessage, createDeviceKey, signInWithDeviceKey } from '../deviceKey';

const mockPost = jest.fn();
jest.mock('@/lib/http', () => {
  const actual = jest.requireActual('@/lib/http');
  return { ...actual, http: { post: (...args: unknown[]) => mockPost(...args) } };
});
const mockStore = jest.fn();
jest.mock('../apiSession', () => ({
  storeApiSession: (session: unknown) => mockStore(session),
}));

const fromBase64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

beforeEach(() => jest.clearAllMocks());

describe('device keys', () => {
  it('registers a public key, then signs the challenge the way the API verifies it', async () => {
    mockPost.mockResolvedValueOnce({ id: 'k1' });
    const key = await createDeviceKey();
    expect(key?.keyId).toBe('k1');
    const [path, body] = mockPost.mock.calls[0]!;
    expect(path).toBe('/me/biometric-keys');
    expect(body).toMatchObject({ algorithm: 'ed25519', deviceType: 'ios' });
    const publicKey = fromBase64(body.publicKey);
    expect(publicKey).toHaveLength(32);

    const session = { accessToken: 'a', refreshToken: 'r', user: { id: 'u1' } };
    mockPost
      .mockResolvedValueOnce({ challengeId: 'c1', challenge: 'bm9uY2U=', expiresAt: 'x' })
      .mockResolvedValueOnce({ status: 'signedIn', session });
    await signInWithDeviceKey(key!);

    expect(mockPost).toHaveBeenNthCalledWith(
      2,
      '/auth/biometric/challenge',
      { keyId: 'k1' },
      { auth: false },
    );
    const [verifyPath, verifyBody, options] = mockPost.mock.calls[2]!;
    expect(verifyPath).toBe('/auth/biometric/verify');
    expect(options).toEqual({ auth: false });
    // What the backend does: check the signature over the agreed message with the stored key.
    const message = new TextEncoder().encode('field-biometric-v1:c1:bm9uY2U=');
    expect(challengeMessage('c1', 'bm9uY2U=')).toEqual(message);
    expect(ed25519.verify(fromBase64(verifyBody.signature), message, publicKey)).toBe(true);
    expect(mockStore).toHaveBeenCalledWith(session);
  });

  it('reports no device keys while the API lacks the endpoint', async () => {
    mockPost.mockRejectedValueOnce(new ApiError(404, 'Cannot POST /me/biometric-keys'));
    await expect(createDeviceKey()).resolves.toBeNull();
  });
});
