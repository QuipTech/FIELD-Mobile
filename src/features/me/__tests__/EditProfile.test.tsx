import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { toast } from '@/components';
import { EditProfile } from '../EditProfile';

const mockMutate = jest.fn();
const mockUpload = jest.fn();
let mockProfile: {
  phoneNumber: string | null;
  tenant: { id: string; name: string } | null;
} | null = null;
jest.mock('../api', () => ({
  useUpdateProfile: () => ({ mutate: mockMutate, isPending: false }),
  useUploadAvatar: () => ({ mutate: mockUpload, isPending: false }),
}));
jest.mock('@/auth/access', () => ({
  useAccess: (select: (s: { profile: typeof mockProfile }) => unknown) =>
    select({ profile: mockProfile }),
}));
const mockPick = jest.fn();
jest.mock('../pickAvatar', () => ({ pickAvatar: () => mockPick() }));
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

beforeEach(() => {
  jest.clearAllMocks();
  mockProfile = null;
});

it('uploads a picked photo straight away', async () => {
  const file = { uri: 'file:///a.jpg', name: 'a.jpg', type: 'image/jpeg' };
  mockPick.mockResolvedValue(file);
  await setup();
  await fireEvent.press(screen.getByRole('button', { name: 'Change profile photo' }));
  await waitFor(() => expect(mockUpload).toHaveBeenCalledWith(file, expect.any(Object)));
});

it('does nothing when picking a photo is cancelled', async () => {
  mockPick.mockResolvedValue(null);
  await setup();
  await fireEvent.press(screen.getByRole('button', { name: 'Change profile photo' }));
  await waitFor(() => expect(mockPick).toHaveBeenCalled());
  expect(mockUpload).not.toHaveBeenCalled();
});

it('saves a changed phone number and shows the company read-only', async () => {
  mockProfile = { phoneNumber: '0400 000 000', tenant: { id: 't1', name: 'Acme Mining' } };
  await setup();
  expect(screen.getByLabelText('Company')).toHaveProp('value', 'Acme Mining');
  expect(screen.getByLabelText('Company')).toHaveProp('editable', false);
  await fireEvent.changeText(screen.getByLabelText('Phone'), '');
  expect(screen.getByRole('button', { name: 'Save changes' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Phone'), ' 0411 111 111 ');
  await fireEvent.press(screen.getByRole('button', { name: 'Save changes' }));
  expect(mockMutate).toHaveBeenCalledWith(
    { firstName: 'Jo', lastName: 'Okoye', phoneNumber: '0411 111 111' },
    expect.any(Object),
  );
});

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
