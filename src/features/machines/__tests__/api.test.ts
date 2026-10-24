import { toHomeData } from '@/features/home/data';
import { API_COMPONENTS, API_DASHBOARD, API_HISTORY, API_MACHINES } from '@/test/fakeApi';
import { toMachine, toTimelineEntry } from '../api';
import { toComponent, toComponentGroups } from '../componentsApi';
import { machineIdFromCode } from '../data';

describe('machine mapping', () => {
  it('maps API status and names to the screens’ shape', () => {
    expect(API_MACHINES.map(toMachine).map((m) => [m.label, m.model, m.status])).toEqual([
      ['HT-2201', 'CAT 793F', 'down'],
      ['LD-0904', 'Komatsu WA900', 'due'],
      ['HT-2188', 'CAT 793F', 'ok'],
    ]);
  });

  it('labels a machine by fleet number, then label, then serial', () => {
    const base = { id: 'uuid-1', serialNumber: 'SN-1', status: 'running' };
    expect(toMachine({ ...base, fleetNumber: 'HT-1', label: 'L-1' }).label).toBe('HT-1');
    expect(toMachine({ ...base, label: 'L-1' }).label).toBe('L-1');
    expect(toMachine(base).label).toBe('SN-1');
    expect(toMachine({ ...base, site: null, operatingHours: null })).toMatchObject({
      site: '',
      hours: undefined,
    });
  });

  it('resolves scanned codes by label or serial, routing by id', () => {
    const fleet = [
      toMachine({ id: 'uuid-9', label: 'HT-2201', serialNumber: '4GZ01288', status: 'down' }),
    ];
    expect(machineIdFromCode(fleet, 'ht-2201')).toBe('uuid-9');
    expect(machineIdFromCode(fleet, 'https://field.app/machines/4GZ01288')).toBe('uuid-9');
    expect(machineIdFromCode(fleet, 'nope')).toBeUndefined();
  });

  it('turns history entries into timeline entries', () => {
    const [fault, repair] = API_HISTORY.map(toTimelineEntry);
    expect(fault).toMatchObject({ type: 'fault', by: 'System', detail: '14,100 h' });
    expect(repair).toMatchObject({
      type: 'repair',
      title: 'Main hydraulic pump replaced',
      by: 'J. Okoye',
      detail: '14,208 h · 3.5 h downtime',
      photos: 2,
    });
    expect(toTimelineEntry({ ...API_HISTORY[0]!, entryType: 'calibration' }).type).toBe('note');
  });

  it('groups components by system and flags a condition', () => {
    expect(toComponentGroups(API_COMPONENTS.map(toComponent))).toEqual([
      { id: 'pt', name: 'Powertrain', count: 2, issue: { label: 'Worn', tone: 'amber' } },
      { id: 'hy', name: 'Hydraulics', count: 1 },
    ]);
  });

  it('maps condition codes, notes and severity to a component flag', () => {
    const base = { id: 'c', systemId: 's', systemName: 'S', name: 'Pump' };
    expect(toComponent({ ...base, condition: 'ok' }).issue).toBeUndefined();
    expect(toComponent({ ...base, condition: 'fault' }).issue).toEqual({
      label: 'Fault',
      tone: 'danger',
    });
    expect(
      toComponent({
        ...base,
        condition: 'worn',
        conditionNote: 'Seal leak',
        conditionSeverity: 'critical',
      }).issue,
    ).toEqual({ label: 'Seal leak', tone: 'danger' });
  });

  it('reads signed photo URLs from history', () => {
    const entry = { ...API_HISTORY[1]!, photos: [{ id: 'p1', signedUrl: 'https://s/p1.jpg' }] };
    expect(toTimelineEntry(entry).photoUris).toEqual(['https://s/p1.jpg']);
  });
});

describe('dashboard mapping', () => {
  it('builds Home from GET /dashboard', () => {
    const home = toHomeData(API_DASHBOARD, Date.parse('2026-03-12T14:00:00Z'));
    expect(home).toMatchObject({ site: 'Pit 4', machineCount: 2 });
    expect(home.uptime).toEqual({
      percent: 91,
      weeks: 8,
      weekly: [88, 92, 85, 95, 90, 97, 87, 94],
    });
    expect(home.machines[0]).toEqual({
      id: 'HT-2201',
      title: 'HT-2201 · CAT 793F',
      detail: 'Pit 4 · 14,208 h',
      status: 'down',
    });
    expect(home.recent[0]?.title).toBe('Repair logged on HT-2201');
  });

  it('hides uptime until the API tracks any (a new company)', () => {
    const empty = {
      ...API_DASHBOARD,
      fleetUptime: {
        averagePercent: null,
        weeks: [{ weekStart: '2026-10-19', uptimePercent: null }],
      },
      myMachines: [],
    };
    expect(toHomeData(empty)).toMatchObject({ uptime: null, site: '', machineCount: 0 });
  });
});
