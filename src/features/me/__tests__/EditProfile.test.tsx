import { fireEvent, render, screen } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { toast } from '@/components';
import { EditProfile } from '../EditProfile';

const mockMutate = jest.fn();
jest.mock('../api', () => ({ useUpdateProfile: () => ({ mutate: mockMutate, isPending: false }) }));
jest.mock('@/auth/access', () => ({ useAccess: () => null }));
jest.mock('@/auth/useCurrentUser', () => ({
  useCurrentUser: () => ({
    data: { id: 'u1', firstName: 'Jo', lastName: 'Okoye', email: 'jo@example.com' },
  }),
}));
jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));

const setup = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <EditProfile />
    </SafeAreaProvider>,
  );

beforeEach(() => jest.clearAllMocks());

it('prevents unchanged and blank names from being saved', async () => {
  await setup();
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('First name'), '   ');
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  expect(screen.getByLabelText('Email')).toHaveProp('editable', false);
});

it('trims names and closes only after a successful save', async () => {
  await setup();
  await fireEvent.changeText(screen.getByLabelText('First name'), '  Jane  ');
  await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
  expect(mockMutate).toHaveBeenCalledWith(
    { firstName: 'Jane', lastName: 'Okoye' },
    expect.any(Object),
  );
  expect(router.back).not.toHaveBeenCalled();
  const callbacks = mockMutate.mock.calls[0][1];
  callbacks.onSuccess();
  expect(router.back).toHaveBeenCalledTimes(1);
});

it('shows save failures without closing or losing the entered name', async () => {
  const show = jest.spyOn(toast, 'show');
  await setup();
  await fireEvent.changeText(screen.getByLabelText('First name'), 'Jane');
  await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
  mockMutate.mock.calls[0][1].onError(new Error('Save failed'));
  expect(show).toHaveBeenCalled();
  expect(router.back).not.toHaveBeenCalled();
  expect(screen.getByLabelText('First name')).toHaveProp('value', 'Jane');
});
