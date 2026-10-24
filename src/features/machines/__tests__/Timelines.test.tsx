import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { HT_2201_RECORDS } from '@/test/fixtures/machines/records';
import { MachineManuals } from '../Manuals';
import { ConfigurationTimeline, MachineTimeline } from '../Timelines';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderScreen = (ui: ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

const RECORDS = HT_2201_RECORDS;

describe('MachineTimeline', () => {
  it('filters entries and offers to add one', async () => {
    const props = { onAddEntry: jest.fn(), onOpenPhoto: jest.fn() };
    await renderScreen(<MachineTimeline entries={RECORDS.history} filter="fault" {...props} />);
    expect(screen.getByText('E-2204 · accumulator pre-charge low')).toBeTruthy();
    expect(screen.queryByText('250 h walkaround')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Add entry' }));
    expect(props.onAddEntry).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Export' })).toBeNull();
  });

  it('offers "Add photos" on synced entries only', async () => {
    const onAddPhotos = jest.fn();
    const synced = {
      id: 'e2',
      type: 'repair' as const,
      title: 'Pump replaced',
      at: '2026-03-12',
      by: 'Jo',
    };
    const queued = { ...synced, id: 'local-1', title: 'Seal checked', pending: true };
    await renderScreen(
      <MachineTimeline
        entries={[queued, synced]}
        filter="all"
        onAddEntry={jest.fn()}
        onOpenPhoto={jest.fn()}
        onAddPhotos={onAddPhotos}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Add photos to Seal checked' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Add photos to Pump replaced' }));
    expect(onAddPhotos).toHaveBeenCalledWith(synced);
  });

  it('lets admins export', async () => {
    const onExport = jest.fn();
    await renderScreen(
      <MachineTimeline
        entries={RECORDS.history}
        filter="all"
        onAddEntry={jest.fn()}
        onOpenPhoto={jest.fn()}
        onExport={onExport}
      />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Export' }));
    expect(onExport).toHaveBeenCalledTimes(1);
  });
});

describe('ConfigurationTimeline', () => {
  it('hides restore from technicians', async () => {
    await renderScreen(<ConfigurationTimeline changes={RECORDS.configuration} />);
    expect(screen.queryByRole('button', { name: 'Restore a snapshot' })).toBeNull();
  });

  it('offers restore to admins', async () => {
    const onRestore = jest.fn();
    await renderScreen(
      <ConfigurationTimeline changes={RECORDS.configuration} onRestore={onRestore} />,
    );
    await fireEvent.press(screen.getByRole('button', { name: 'Restore a snapshot' }));
    expect(onRestore).toHaveBeenCalledTimes(1);
  });
});

describe('MachineManuals', () => {
  it('searches documents', async () => {
    await renderScreen(
      <MachineManuals
        manuals={RECORDS.manuals}
        onOpenManual={jest.fn()}
        onDownloadManual={jest.fn()}
      />,
    );
    expect(screen.getAllByText('Offline')).toHaveLength(2);
    await fireEvent.changeText(screen.getByLabelText('Search manuals'), 'wiring');
    expect(screen.getByText('Wiring diagram — electrical')).toBeTruthy();
    expect(screen.queryByText('Operator & maintenance manual')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Search manuals'), 'gearbox');
    expect(screen.getByText('No documents match')).toBeTruthy();
  });
});
