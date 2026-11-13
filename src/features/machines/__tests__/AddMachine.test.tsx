import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { router } from 'expo-router';

import { ApiError, http } from '@/lib/http';
import { AddMachine } from '../AddMachine';

jest.mock('@/lib/http', () => ({
  ...jest.requireActual('@/lib/http/errors'),
  http: {
    get: jest.fn(() =>
      Promise.resolve([
        {
          id: 'cat',
          name: 'CAT',
          models: [
            { id: 'm793', name: '793F', machineClass: 'Haul truck' },
            { id: 'mD10', name: 'D10T', machineClass: 'Dozer' },
          ],
        },
        { id: 'kom', name: 'Komatsu', models: [{ id: 'mPC', name: 'PC8000' }] },
      ]),
    ),
    post: jest.fn(() => Promise.resolve({ id: 'new-1' })),
  },
}));
beforeEach(() => jest.clearAllMocks());

jest.mock('@/auth/access', () => ({
  useAccess: (select: (s: unknown) => unknown) => select({ profile: { site: 'Pit 4' } }),
}));
jest.mock('expo-router', () => ({ router: { back: jest.fn() }, Stack: { Screen: () => null } }));

const setup = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <QueryClientProvider client={new QueryClient()}>
        <AddMachine />
      </QueryClientProvider>
    </SafeAreaProvider>,
  );

it('registers a machine with make, model, plant ID, site, hours and status', async () => {
  await setup();
  const model = await screen.findByRole('button', { name: 'Model: Choose a model' });
  expect(model).toBeDisabled();

  await fireEvent.press(screen.getByRole('button', { name: 'Make: Choose a make' }));
  await fireEvent.press(await screen.findByText('CAT'));
  await fireEvent.press(screen.getByRole('button', { name: 'Model: Choose a model' }));
  await fireEvent.press(await screen.findByText('793F · Haul truck'));

  await fireEvent.changeText(screen.getByLabelText('Serial number'), ' SN123 ');
  await fireEvent.changeText(screen.getByLabelText('Plant ID / Asset number'), 'HT-2201');
  await fireEvent.changeText(screen.getByLabelText('Hours'), '12.5');
  expect(screen.getByText('Whole number')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Add machine' })).toBeDisabled();
  await fireEvent.changeText(screen.getByLabelText('Hours'), '1200');
  await fireEvent.press(screen.getByText('Service due'));
  await fireEvent.press(screen.getByRole('button', { name: 'Add machine' }));

  await waitFor(() =>
    expect(http.post).toHaveBeenCalledWith('/machines', {
      modelId: 'm793',
      serialNumber: 'SN123',
      assetNumber: 'HT-2201',
      site: 'Pit 4',
      operatingHours: 1200,
      status: 'service_due',
    }),
  );
  await waitFor(() => expect(router.back).toHaveBeenCalled());
});

it('shows a duplicate serial under the field and keeps what was typed', async () => {
  jest.mocked(http.post).mockRejectedValueOnce(new ApiError(409, 'Conflict'));
  await setup();
  await fireEvent.press(await screen.findByRole('button', { name: 'Make: Choose a make' }));
  await fireEvent.press(await screen.findByText('Komatsu'));
  await fireEvent.press(screen.getByRole('button', { name: 'Model: Choose a model' }));
  await fireEvent.press(await screen.findByText('PC8000'));
  await fireEvent.changeText(screen.getByLabelText('Serial number'), 'SN1');
  await fireEvent.press(screen.getByRole('button', { name: 'Add machine' }));
  expect(
    await screen.findByText(
      'A machine with this serial number is already registered in your organisation.',
    ),
  ).toBeTruthy();
  expect(screen.getByLabelText('Serial number')).toHaveProp('value', 'SN1');
  expect(router.back).not.toHaveBeenCalled();
});

it('caps hours at 1,000,000', async () => {
  await setup();
  await screen.findByRole('button', { name: 'Make: Choose a make' });
  await fireEvent.changeText(screen.getByLabelText('Hours'), '1000001');
  expect(screen.getByText('Max 1,000,000')).toBeTruthy();
});
