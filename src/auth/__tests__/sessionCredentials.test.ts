import * as SecureStore from 'expo-secure-store';

import { useSession } from '../session';
import {
  forgetSessionCredentialsOnSignOut,
  rememberSessionCredentials,
  sessionPassword,
} from '../sessionCredentials';

jest.mock('aws-amplify/auth', () => ({ getCurrentUser: jest.fn() }));
jest.mock('aws-amplify/utils', () => ({ Hub: { listen: jest.fn() } }));
jest.mock('../apiSession', () => ({ hasApiSession: jest.fn(), syncApiSession: jest.fn() }));
const mockStore = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  setItemAsync: jest.fn(async (k: string, v: string) => void mockStore.set(k, v)),
  getItemAsync: jest.fn(async (k: string) => mockStore.get(k) ?? null),
  deleteItemAsync: jest.fn(async (k: string) => void mockStore.delete(k)),
}));

beforeEach(() => {
  mockStore.clear();
  useSession.setState({ status: 'signedIn' });
});

describe('session credentials', () => {
  it("returns this session's password for the same account only", async () => {
    await rememberSessionCredentials('Tech@QuipTech.com.au', 'pw');
    await expect(sessionPassword('tech@quiptech.com.au')).resolves.toBe('pw');
    await expect(sessionPassword('other@quiptech.com.au')).resolves.toBeNull();
  });

  it('keeps them on this device only', async () => {
    await rememberSessionCredentials('a@b.co', 'pw');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(expect.any(String), expect.any(String), {
      keychainAccessible: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
    });
  });

  it('forgets them when the session ends', async () => {
    const stop = forgetSessionCredentialsOnSignOut();
    await rememberSessionCredentials('a@b.co', 'pw');
    useSession.setState({ status: 'signedOut' });
    await Promise.resolve();
    await expect(sessionPassword('a@b.co')).resolves.toBeNull();
    stop();
  });
});
