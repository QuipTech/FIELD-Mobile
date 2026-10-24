import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { type Machine } from '@/features/machines/data';
import { SAMPLE_MACHINES } from '@/test/fixtures/machines/fleet';
import { useMachineRecords } from '@/features/machines/records';
import { API_HISTORY, installFakeApi } from '@/test/fakeApi';
import { CaptureFlow } from '../CaptureFlow';
import { useOutbox } from '@/offline/outbox';
import { entryBody, queueEntry } from '../queue';
import { emptyDraft, toEntry } from '../store';

jest.mock('@/features/camera/nativeCamera', () => ({ expoCamera: null }));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const FLEET: Machine[] = Object.values(SAMPLE_MACHINES);

beforeEach(() => useOutbox.setState({ items: [] }));

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

  it('tags the entry with the component affected', async () => {
    const onSave = jest.fn();
    const pump = {
      id: 'c-pump',
      systemId: 'hy',
      systemName: 'Hydraulics',
      name: 'Main pump',
    };
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <CaptureFlow
          machines={FLEET}
          components={[pump]}
          initial={{ machineId: 'LD-0904', title: 'Pump seal' }}
          onSave={onSave}
          onClose={jest.fn()}
        />
      </SafeAreaProvider>,
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Component affected: None' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Hydraulics › Main pump' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Component replaced' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Next — photos' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Skip photos' }));
    expect(screen.getByText(/Hydraulics › Main pump/)).toBeTruthy();
    await fireEvent.changeText(screen.getByLabelText('Hour meter reading'), '14,230.4');
    await fireEvent.changeText(screen.getByLabelText('Downtime in hours'), '3.5');
    await fireEvent.press(screen.getByRole('button', { name: 'Save entry' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ componentId: 'c-pump' }));
    expect(entryBody(onSave.mock.calls[0][0])).toMatchObject({
      entryType: 'repair',
      componentId: 'c-pump',
      componentReplaced: true,
      operatingHours: 14230,
      downtimeHours: 3.5,
    });
    // Only a repair records a replacement.
    expect(entryBody({ ...onSave.mock.calls[0][0], type: 'service' })).not.toHaveProperty(
      'componentReplaced',
    );
  });
});

describe('logged entries', () => {
  it('builds a timeline entry and shows it first in the machine history', async () => {
    const draft = {
      ...emptyDraft({ title: ' Accumulator recharged ' }),
      machineId: 'HT-2201',
      notes: 'Held 15 min.',
      hours: '14230',
      photos: ['file:///a.jpg'],
    };
    const entry = toEntry(draft, new Date('2026-10-17T09:00:00Z'));
    expect(entry).toMatchObject({
      title: 'Accumulator recharged',
      detail: 'Held 15 min. · Hour meter 14,230 h',
      by: 'You',
      photos: 1,
    });

    installFakeApi();
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = await renderHook(() => useMachineRecords('HT-2201'), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });
    // The machine's history from the API first, then the entry logged on this device on top.
    await waitFor(() => expect(result.current.history).toHaveLength(API_HISTORY.length));
    await act(() => {
      queueEntry(draft);
    });
    expect(result.current.history).toHaveLength(API_HISTORY.length + 1);
    expect(result.current.history[0]).toMatchObject({
      title: 'Accumulator recharged',
      pending: true,
    });
  });
});
