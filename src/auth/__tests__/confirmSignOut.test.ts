import { Alert } from 'react-native';

import { confirmSignOut } from '../confirmSignOut';
import { signOutUser } from '../flows';
import { runAuth } from '../runAuth';

let mockPending = 0;
jest.mock('@/offline/outbox', () => ({
  useOutbox: { getState: () => ({ items: Array.from({ length: mockPending }) }) },
}));
jest.mock('../flows', () => ({ signOutUser: jest.fn() }));
jest.mock('../runAuth', () => ({ runAuth: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  mockPending = 0;
  jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
});

it('signs out only after the destructive confirmation is pressed', () => {
  confirmSignOut();
  expect(runAuth).not.toHaveBeenCalled();
  const buttons = jest.mocked(Alert.alert).mock.calls[0]![2]!;
  expect(buttons[0]).toMatchObject({ text: 'Cancel', style: 'cancel' });
  buttons[1]!.onPress!();
  expect(runAuth).toHaveBeenCalledWith(signOutUser);
});

it.each([1, 3])('warns before losing %s pending changes', (pending) => {
  mockPending = pending;
  confirmSignOut();
  expect(Alert.alert).toHaveBeenCalledWith(
    'Sign out?',
    expect.stringContaining(`${pending} change${pending === 1 ? '' : 's'} haven’t uploaded yet`),
    expect.any(Array),
  );
  expect(runAuth).not.toHaveBeenCalled();
});
