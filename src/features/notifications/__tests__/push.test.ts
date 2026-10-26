import * as Notifications from 'expo-notifications';

import { useSession } from '@/auth/session';
import { registerForPush, startPushSync, unregisterPushDevice } from '../push';
import { pushData } from '../pushResponses';

jest.mock('aws-amplify/auth', () => ({}));
jest.mock('aws-amplify/utils', () => ({ Hub: { listen: jest.fn() } }));
const mockPost = jest.fn();
const mockDelete = jest.fn();
jest.mock('@/lib/http', () => ({
  http: {
    post: (...args: unknown[]) => mockPost(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
}));
const mockStore = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: async (k: string) => mockStore.get(k) ?? null,
  setItemAsync: async (k: string, v: string) => void mockStore.set(k, v),
  deleteItemAsync: async (k: string) => void mockStore.delete(k),
}));

const permissions = jest.mocked(Notifications.getPermissionsAsync);
const request = jest.mocked(Notifications.requestPermissionsAsync);
const asPermission = (granted: boolean, canAskAgain = true) =>
  ({ granted, canAskAgain }) as Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>;

beforeEach(() => {
  jest.clearAllMocks();
  mockStore.clear();
  mockPost.mockResolvedValue({ id: 'dev-1', deviceType: 'ios', tokenSuffix: 'a91f2c' });
  mockDelete.mockResolvedValue(undefined);
  useSession.setState({ status: 'unknown' });
  return unregisterPushDevice(); // also forgets the token registered by the previous test
});

describe('device registration', () => {
  it('asks for permission, then registers the raw native token', async () => {
    permissions.mockResolvedValueOnce(asPermission(false));
    request.mockResolvedValueOnce(asPermission(true));
    await registerForPush();

    expect(mockPost).toHaveBeenCalledWith('/me/devices', {
      deviceType: 'ios',
      pushToken: 'apns-token-a91f2c',
      appVersion: undefined,
    });
    expect(mockStore.get('fieldPushDevice')).toBe('dev-1');
  });

  it('registers a token only once per session', async () => {
    permissions.mockResolvedValue(asPermission(true));
    await Promise.all([registerForPush(), registerForPush()]);
    await registerForPush();
    expect(mockPost).toHaveBeenCalledTimes(1);
    permissions.mockReset();
  });

  it('does not register when permission is refused', async () => {
    permissions.mockResolvedValueOnce(asPermission(false, false));
    await registerForPush();
    expect(request).not.toHaveBeenCalled();
    expect(mockPost).not.toHaveBeenCalled();
  });

  it('registers when the session becomes signed in', async () => {
    permissions.mockResolvedValue(asPermission(true));
    const stop = startPushSync();
    expect(mockPost).not.toHaveBeenCalled();
    useSession.setState({ status: 'signedIn' });
    await new Promise(process.nextTick);
    expect(mockPost).toHaveBeenCalledWith('/me/devices', expect.anything());
    stop();
    permissions.mockReset();
  });

  it('removes the device on sign-out, once', async () => {
    mockStore.set('fieldPushDevice', 'dev-1');
    await unregisterPushDevice();
    await unregisterPushDevice();
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith('/me/devices/dev-1', { retry: false });
    expect(mockStore.has('fieldPushDevice')).toBe(false);
  });
});

describe('push payload', () => {
  const requestWith = (content: unknown, trigger: unknown) =>
    ({ identifier: 'r1', content: { data: content }, trigger }) as never;
  const data = { notificationId: 'n1', kind: 'case_assigned', link: '/cases/1042' };

  it('reads APNs top-level keys from the trigger payload', () => {
    expect(pushData(requestWith({}, { type: 'push', payload: { aps: {}, ...data } }))).toEqual(
      data,
    );
  });

  it('reads FCM data', () => {
    expect(pushData(requestWith(null, { type: 'push', remoteMessage: { data } }))).toEqual(data);
  });
});
