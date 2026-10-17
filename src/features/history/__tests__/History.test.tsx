import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AiHistory } from '../AiHistory';
import { SAMPLE_CONVERSATIONS, SAMPLE_ENTRIES } from '../data';
import { MachineHistory } from '../MachineHistory';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderScreen = (ui: ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

describe('MachineHistory', () => {
  it('filters entries by type and opens one', async () => {
    const onOpenEntry = jest.fn();
    await renderScreen(<MachineHistory entries={SAMPLE_ENTRIES} onOpenEntry={onOpenEntry} />);
    expect(screen.getByText('250 h walkaround')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Repairs' }));
    expect(screen.getByText('Main hydraulic pump replaced')).toBeTruthy();
    expect(screen.queryByText('250 h walkaround')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: /^Repair, .*Main hydraulic pump/ }));
    expect(onOpenEntry).toHaveBeenCalledWith(SAMPLE_ENTRIES[0]);
  });

  it('shows an empty state', async () => {
    await renderScreen(<MachineHistory entries={[]} onOpenEntry={jest.fn()} />);
    expect(screen.getByText('Nothing logged yet')).toBeTruthy();
  });
});

describe('AiHistory', () => {
  it('lists past questions and offers to clear them', async () => {
    const props = { onOpen: jest.fn(), onClear: jest.fn() };
    await renderScreen(<AiHistory conversations={SAMPLE_CONVERSATIONS} {...props} />);
    expect(screen.getByText("What's the torque spec for the final drive bolts?")).toBeTruthy();
    expect(screen.getByText('Yesterday')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: /^DR-4412, 4 days ago/ }));
    expect(props.onOpen).toHaveBeenCalledWith(SAMPLE_CONVERSATIONS[2]);
    await fireEvent.press(screen.getByRole('button', { name: 'Clear AI history' }));
    expect(props.onClear).toHaveBeenCalledTimes(1);
  });

  it('shows an empty state without the clear button', async () => {
    await renderScreen(<AiHistory conversations={[]} onOpen={jest.fn()} onClear={jest.fn()} />);
    expect(screen.getByText('No AI conversations yet')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Clear AI history' })).toBeNull();
  });
});
