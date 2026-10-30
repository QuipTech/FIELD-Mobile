import { ApiError } from '@/lib/http';
import { deleteAccount } from '../accountDeletion';

// Every step records itself, so the test can check the order.
const mockSteps: string[] = [];
const step = (name: string, result?: () => unknown) =>
  jest.fn(async () => {
    mockSteps.push(name);
    return result?.();
  });

// The real session store pulls in Amplify; this test only needs its status.
const mockSession = { status: 'signedIn' };
jest.mock('../session', () => ({
  useSession: {
    getState: () => ({ setStatus: (status: string) => (mockSession.status = status) }),
  },
}));

const mockDelete = jest.fn();
jest.mock('@/lib/http', () => ({
  ...jest.requireActual('@/lib/http'),
  http: { delete: (...args: unknown[]) => mockDelete(...args) },
}));
jest.mock('@/features/notifications/push', () => ({
  unregisterPushDevice: step('unregister push'),
  registerForPush: step('register push again'),
}));
jest.mock('../biometrics', () => ({ forgetBiometricSignIn: step('forget biometrics') }));
jest.mock('../apiSession', () => ({ endApiSession: step('end API session') }));
jest.mock('aws-amplify/auth', () => ({ signOut: step('Cognito sign out') }));
const mockClear = jest.fn();
jest.mock('@/lib/queryClient', () => ({ queryClient: { clear: () => mockClear() } }));
jest.mock('@/offline/outbox', () => ({
  useOutbox: { getState: () => ({ clear: () => mockSteps.push('clear outbox') }) },
}));

beforeEach(() => {
  mockSteps.length = 0;
  mockDelete.mockReset();
  mockClear.mockReset();
  mockSession.status = 'signedIn';
});

describe('deleteAccount', () => {
  it('cleans up while signed in, deletes, then signs out on this phone only', async () => {
    mockDelete.mockImplementation(async () => {
      mockSteps.push('DELETE /users/me');
    });
    await deleteAccount('jo@quiptech.com');
    expect(mockSteps).toEqual([
      'unregister push',
      'forget biometrics',
      'DELETE /users/me',
      'end API session',
      'Cognito sign out',
      'clear outbox',
    ]);
    expect(mockDelete).toHaveBeenCalledWith('/users/me', { retry: false });
    expect(mockClear).toHaveBeenCalled();
    expect(mockSession.status).toBe('signedOut');
  });

  it('stays signed in, and re-registers push, when the API refuses', async () => {
    mockDelete.mockRejectedValue(new ApiError(409, "You're the only Owner of your organisation."));
    await expect(deleteAccount('jo@quiptech.com')).rejects.toThrow('only Owner');
    expect(mockSteps).toContain('register push again');
    expect(mockSteps).not.toContain('end API session');
    expect(mockSession.status).toBe('signedIn');
  });
});
