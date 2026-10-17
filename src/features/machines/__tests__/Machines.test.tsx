import { fireEvent, render, screen } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SAMPLE_CASES } from '@/features/cases/data';
import { SAMPLE_MACHINES, type Machine } from '../data';
import { MachineDetail } from '../MachineDetail';
import { MachinesList } from '../MachinesList';
import { MachineManuals } from '../Manuals';
import { HT_2201_RECORDS } from '../sampleRecords';
import { MachineTimeline } from '../Timelines';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderScreen = (ui: ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

const FLEET: Machine[] = Object.values(SAMPLE_MACHINES);
const HT_2201 = SAMPLE_MACHINES['HT-2201'];
const RECORDS = HT_2201_RECORDS;

describe('MachinesList', () => {
  const setup = async () => {
    const props = { onScan: jest.fn(), onNearMe: jest.fn(), onOpenMachine: jest.fn() };
    await renderScreen(<MachinesList machines={FLEET} homeSite="Pit 4" {...props} />);
    return props;
  };

  it('starts on the home site and can show the whole fleet', async () => {
    const props = await setup();
    expect(screen.getByText('CAT 793F · Bench 3 · 14,208 h')).toBeTruthy();
    expect(screen.queryByText('HT-2188')).toBeNull();

    await fireEvent.press(screen.getByRole('button', { name: 'Site: Pit 4. Remove filter' }));
    expect(screen.getByText('CAT 793F · Pit 2 · 18,402 h')).toBeTruthy();
    expect(screen.getByText('WT-0355')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: /^HT-2201\./ }));
    expect(props.onOpenMachine).toHaveBeenCalledWith('HT-2201');
  });

  it('searches and filters by status, with a way back from no results', async () => {
    await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'Status: Any status' }));
    await fireEvent.press(screen.getByRole('radio', { name: 'Service due' }));
    expect(screen.getByText('LD-0904')).toBeTruthy();
    expect(screen.queryByText('HT-2201')).toBeNull();

    await fireEvent.changeText(screen.getByLabelText('Search assets'), 'sandvik');
    expect(screen.getByText('No machines match')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Clear filters' }));
    expect(screen.getByText('WT-0355')).toBeTruthy();
  });
});

describe('MachineDetail', () => {
  const setup = async () => {
    const props = {
      onAskAi: jest.fn(),
      onLogEntry: jest.fn(),
      onOpenComponent: jest.fn(),
      onSeeAll: jest.fn(),
      onOpenCase: jest.fn(),
      onOpenManual: jest.fn(),
      onDownloadManual: jest.fn(),
    };
    const cases = SAMPLE_CASES.filter((c) => c.machine.id === 'HT-2201');
    await renderScreen(
      <MachineDetail machine={HT_2201} records={RECORDS} cases={cases} {...props} />,
    );
    return props;
  };

  it('shows specs and components', async () => {
    const props = await setup();
    expect(screen.getByText('S/N 4GZ01288')).toBeTruthy();
    expect(screen.getByText('Pit 4 · Bench 3')).toBeTruthy();
    expect(screen.getByText('Fault E-2204')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Hydraulics, 12 components' }));
    expect(props.onOpenComponent).toHaveBeenCalledWith('hydraulics');
    await fireEvent.press(screen.getByRole('button', { name: 'Ask AI' }));
    expect(props.onAskAi).toHaveBeenCalledTimes(1);
  });

  it('previews history, manuals and cases in tabs', async () => {
    const props = await setup();
    await fireEvent.press(screen.getByRole('tab', { name: 'History' }));
    expect(screen.getByText('Main hydraulic pump replaced')).toBeTruthy();
    expect(screen.queryByText('1,000 h service — engine & filters')).toBeNull(); // 4th entry
    await fireEvent.press(screen.getByRole('link', { name: 'View full history (4)' }));
    expect(props.onSeeAll).toHaveBeenCalledWith('history');

    await fireEvent.press(screen.getByRole('tab', { name: 'Manuals' }));
    await fireEvent.press(
      screen.getByRole('button', {
        name: 'Download Bulletin 88 — charge pressure revision for offline use',
      }),
    );
    expect(props.onDownloadManual).toHaveBeenCalledWith(RECORDS.manuals[2]);

    await fireEvent.press(screen.getByRole('tab', { name: 'Cases (1)' }));
    await fireEvent.press(screen.getByRole('button', { name: /^P1, case 1042/ }));
    expect(props.onOpenCase).toHaveBeenCalledWith('1042');
  });
});

describe('MachineTimeline', () => {
  it('filters entries and offers to add one', async () => {
    const props = { onAddEntry: jest.fn(), onOpenPhoto: jest.fn() };
    await renderScreen(<MachineTimeline entries={RECORDS.history} filter="fault" {...props} />);
    expect(screen.getByText('E-2204 · accumulator pre-charge low')).toBeTruthy();
    expect(screen.queryByText('250 h walkaround')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Add entry' }));
    expect(props.onAddEntry).toHaveBeenCalledTimes(1);
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
