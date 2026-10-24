import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { Machine } from '@/features/machines/data';
import type { TimelineEntry } from '@/features/machines/records';
import { useOutbox } from '@/offline/outbox';
import { SAMPLE_MACHINES } from '@/test/fixtures/machines/fleet';
import { queueEntryPhotos } from '../queue';
import { QuickCapture, type QuickCaptureProps } from '../QuickCapture';

// A camera that is ready at once and returns a new file per shot.
jest.mock('@/features/camera/nativeCamera', () => {
  /* eslint-disable @typescript-eslint/no-require-imports */
  const React = require('react');
  let shots = 0;
  const CameraView = React.forwardRef(
    ({ onCameraReady }: { onCameraReady?: () => void }, ref: unknown) => {
      React.useImperativeHandle(ref, () => ({
        takePictureAsync: async () => ({ uri: `file:///shot-${++shots}.jpg` }),
      }));
      React.useEffect(() => onCameraReady?.(), [onCameraReady]);
      return null;
    },
  );
  CameraView.displayName = 'CameraView';
  return { expoCamera: { CameraView, useCameraPermissions: () => [{ granted: true }, jest.fn()] } };
});

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const FLEET: Machine[] = Object.values(SAMPLE_MACHINES);
const ENTRIES: TimelineEntry[] = [
  { id: 'e1', type: 'fault', title: 'Accumulator low', at: '2026-02-28T12:00:00Z', by: 'System' },
  {
    id: 'e2',
    type: 'inspection',
    title: 'Final drive inspection',
    at: '2026-03-12T12:00:00Z',
    by: 'Jo',
  },
];

const setup = async (overrides: Partial<QuickCaptureProps> = {}) => {
  const props: QuickCaptureProps = {
    machines: FLEET,
    machineId: 'HT-2201',
    onMachineChange: jest.fn(),
    entries: ENTRIES,
    onSave: jest.fn(),
    onClose: jest.fn(),
    ...overrides,
  };
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <QuickCapture {...props} />
    </SafeAreaProvider>,
  );
  return props;
};

beforeEach(() => useOutbox.setState({ items: [] }));

describe('QuickCapture', () => {
  it('opens on the camera and attaches the shots to the latest entry', async () => {
    const props = await setup();
    expect(screen.getByText('Capture')).toBeTruthy();
    expect(screen.getByText('Uploads when connected · compressed to 2000 px')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /^History entry: Final drive inspection/ }),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save photos' })).toBeDisabled();

    await fireEvent.press(screen.getByRole('button', { name: 'Take photo' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Take photo' }));
    await fireEvent.changeText(screen.getByLabelText('Note'), 'Seal weeping at 6 o’clock');
    await fireEvent.press(screen.getByRole('button', { name: 'Save 2 photos' }));

    expect(props.onSave).toHaveBeenCalledWith({
      machineId: 'HT-2201',
      entryId: 'e2',
      photos: [expect.stringMatching(/^file:/), expect.stringMatching(/^file:/)],
      note: 'Seal weeping at 6 o’clock',
    });
  });

  it('starts on the entry it was opened from, and switching machine asks the route', async () => {
    const props = await setup({ initialEntryId: 'e1' });
    expect(screen.getByRole('button', { name: /^History entry: Accumulator low/ })).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Machine: HT-2201' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'LD-0904' }));
    expect(props.onMachineChange).toHaveBeenCalledWith('LD-0904');
  });

  it('explains why it can’t save when the machine has no synced entries', async () => {
    await setup({ entries: [] });
    await fireEvent.press(screen.getByRole('button', { name: 'Take photo' }));
    expect(screen.getByText(/No synced entries on this machine yet/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Save 1 photo' })).toBeDisabled();
  });
});

describe('queueEntryPhotos', () => {
  it('queues one entryPhoto per shot, with the note on the first', () => {
    queueEntryPhotos({
      machineId: 'HT-2201',
      entryId: 'e2',
      photos: ['file:///a.jpg', 'file:///b.jpg'],
      note: '  Seal weeping  ',
    });
    expect(useOutbox.getState().items).toEqual([
      expect.objectContaining({
        kind: 'entryPhoto',
        machineId: 'HT-2201',
        entryId: 'e2',
        photo: { uri: 'file:///a.jpg', name: 'photo-1.jpg', type: 'image/jpeg' },
        caption: 'Seal weeping',
      }),
      expect.not.objectContaining({ caption: expect.anything() }),
    ]);
    expect(useOutbox.getState().items[1]).toMatchObject({ photo: { name: 'photo-2.jpg' } });
  });
});
