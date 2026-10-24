import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import CapturePhotoRoute from '@/app/capture-photo';
import { useOutbox } from '@/offline/outbox';
import { installFakeApi } from '@/test/fakeApi';

const mockBack = jest.fn();
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => ({
  router: { back: () => mockBack() },
  useLocalSearchParams: () => mockParams,
}));
// No camera in this build: the route must still load the picker from the API.
jest.mock('@/features/camera/nativeCamera', () => ({ expoCamera: null }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderRoute = async (params: Record<string, string>) => {
  mockParams = params;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={client}>
        <CapturePhotoRoute />
      </QueryClientProvider>
    </SafeAreaProvider>,
  );
};

beforeAll(() => {
  installFakeApi();
});
beforeEach(() => {
  useOutbox.setState({ items: [] });
  mockBack.mockClear();
});

describe('/capture-photo', () => {
  it('defaults to the machine’s latest synced entry from the API', async () => {
    await renderRoute({ machineId: 'HT-2201' });
    expect(
      await screen.findByRole('button', { name: /^History entry: Main hydraulic pump replaced/ }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Machine: HT-2201' })).toBeTruthy();
  });

  it('opens on the entry passed from the history row', async () => {
    await renderRoute({ machineId: 'HT-2201', entryId: 'e1' });
    expect(
      await screen.findByRole('button', { name: /^History entry: E-2204 · accumulator/ }),
    ).toBeTruthy();
  });

  it('closes without asking when nothing was captured', async () => {
    await renderRoute({ machineId: 'HT-2201' });
    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(useOutbox.getState().items).toEqual([]);
  });
});
