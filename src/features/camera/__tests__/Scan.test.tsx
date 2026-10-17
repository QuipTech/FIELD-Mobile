import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { machineIdFromCode, SAMPLE_MACHINES, type Machine } from '@/features/machines/data';
import { ScanScreen } from '../ScanScreen';

// A build without the camera's native module: the screen must still work by typing.
jest.mock('../nativeCamera', () => ({ expoCamera: null }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const FLEET: Machine[] = Object.values(SAMPLE_MACHINES);

describe('machineIdFromCode', () => {
  it('accepts fleet numbers and tag URLs, any case', () => {
    expect(machineIdFromCode(FLEET, ' ht-2201 ')).toBe('HT-2201');
    expect(machineIdFromCode(FLEET, 'https://field.quiptech.com.au/machines/LD-0904?src=tag')).toBe(
      'LD-0904',
    );
    expect(machineIdFromCode(FLEET, 'XX-0000')).toBeUndefined();
  });
});

describe('ScanScreen', () => {
  const setup = async () => {
    const props = {
      resolve: (code: string) => machineIdFromCode(FLEET, code),
      onFound: jest.fn(),
      onClose: jest.fn(),
    };
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ScanScreen {...props} />
      </SafeAreaProvider>,
    );
    return props;
  };

  it('falls back to typing the fleet number when there is no camera', async () => {
    const props = await setup();
    expect(screen.getByText('Camera not available')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Open' })).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Fleet number'), 'zz-1');
    await fireEvent.press(screen.getByRole('button', { name: 'Open' }));
    expect(screen.getByText('“zz-1” isn’t a machine in your fleet.')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Fleet number'), 'dr-4412');
    await fireEvent.press(screen.getByRole('button', { name: 'Open' }));
    expect(props.onFound).toHaveBeenCalledWith('DR-4412');

    await fireEvent.press(screen.getByRole('button', { name: 'Close' }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });
});
