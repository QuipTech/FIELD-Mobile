import { act, fireEvent, render, renderHook, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SAMPLE_MACHINES, type Machine } from '@/features/machines/data';
import { useMachineRecords } from '@/features/machines/records';
import { CaptureFlow } from '../CaptureFlow';
import { emptyDraft, toEntry, useEntryLog } from '../store';

jest.mock('@/features/camera/nativeCamera', () => ({ expoCamera: null }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const FLEET: Machine[] = Object.values(SAMPLE_MACHINES);

beforeEach(() => useEntryLog.setState({ entries: [] }));

describe('CaptureFlow', () => {
  it('walks details → photos → notes and saves the draft', async () => {
    const onSave = jest.fn();
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <CaptureFlow machines={FLEET} onSave={onSave} onClose={jest.fn()} />
      </SafeAreaProvider>,
    );

    const next = screen.getByRole('button', { name: 'Next — photos' });
    expect(next).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'LD-0904' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Inspection' }));
    await fireEvent.changeText(screen.getByLabelText('What was done'), '250 h walkaround');
    await fireEvent.press(next);

    expect(screen.getByText('Step 2 of 3 · Photos')).toBeTruthy();
    expect(screen.getByText('Camera not available')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Take photo' })).toBeDisabled();
    await fireEvent.press(screen.getByRole('button', { name: 'Skip photos' }));

    expect(screen.getByText('No photos')).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Hour meter reading'), '9,800');
    await fireEvent.changeText(screen.getByLabelText('Notes'), 'All good.');
    await fireEvent.press(screen.getByRole('button', { name: 'Save entry' }));
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        machineId: 'LD-0904',
        type: 'inspection',
        title: '250 h walkaround',
        hours: '9,800',
        notes: 'All good.',
      }),
    );
  });
});

describe('logged entries', () => {
  it('builds a timeline entry and shows it first in the machine history', async () => {
    const entry = toEntry(
      {
        ...emptyDraft({ title: ' Accumulator recharged ' }),
        machineId: 'HT-2201',
        notes: 'Held 15 min.',
        hours: '14230',
        photos: ['file:///a.jpg'],
      },
      new Date('2026-10-17T09:00:00Z'),
    );
    expect(entry).toMatchObject({
      title: 'Accumulator recharged',
      detail: 'Held 15 min. · Hour meter 14,230 h',
      by: 'You',
      photos: 1,
    });

    const { result } = await renderHook(() => useMachineRecords('HT-2201'));
    const before = result.current.history.length;
    await act(() => useEntryLog.getState().add(entry));
    expect(result.current.history).toHaveLength(before + 1);
    expect(result.current.history[0]?.title).toBe('Accumulator recharged');
  });
});
