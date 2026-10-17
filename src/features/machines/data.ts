import type { PillTone } from '@/components/Pill/Pill';
import { colors } from '@/theme';

export type MachineStatus = 'down' | 'due' | 'ok';
export type MachineRef = { id: string; model: string; status: MachineStatus };

export type Machine = MachineRef & {
  make: string;
  site: string;
  /** Where on site, e.g. "Bench 3". */
  bench?: string;
  /** Engine hours. */
  hours?: number;
  serial: string;
  /** TODO(api): photo URL from the asset register. */
  photoUrl?: string;
};

export const MACHINE_STATUS: Record<
  MachineStatus,
  { label: string; tone: PillTone; fg: string; bg: string }
> = {
  down: { label: 'Down', tone: 'danger', fg: colors.danger, bg: colors.dangerTint },
  due: { label: 'Due', tone: 'amber', fg: colors.amber, bg: colors.amberTint },
  ok: { label: 'Running', tone: 'neutral', fg: colors.inkMuted, bg: colors.fill },
};

/**
 * TODO(api): the M3 design's sample fleet, shared by the Cases, Notifications and History sample
 * data until the machines endpoint is wired up. Matches the machines on Home.
 */
export const SAMPLE_MACHINES = {
  'HT-2201': {
    id: 'HT-2201',
    make: 'CAT',
    model: 'CAT 793F',
    status: 'down',
    site: 'Pit 4',
    bench: 'Bench 3',
    hours: 14208,
    serial: '4GZ01288',
  },
  'LD-0904': {
    id: 'LD-0904',
    make: 'Komatsu',
    model: 'Komatsu WA900',
    status: 'due',
    site: 'Pit 4',
    hours: 9771,
    serial: 'A90217',
  },
  'DR-4412': {
    id: 'DR-4412',
    make: 'Sandvik',
    model: 'Sandvik DR410',
    status: 'ok',
    site: 'Pit 4',
    bench: 'Bench 7',
    serial: 'DR410-0388',
  },
  'HT-2188': {
    id: 'HT-2188',
    make: 'CAT',
    model: 'CAT 793F',
    status: 'ok',
    site: 'Pit 2',
    hours: 18402,
    serial: '4GZ01107',
  },
  'WT-0355': {
    id: 'WT-0355',
    make: 'CAT',
    model: 'CAT 777G',
    status: 'ok',
    site: 'Pit 2',
    hours: 12640,
    serial: 'TWR00942',
  },
} satisfies Record<string, Machine>;

const FLEET: Machine[] = Object.values(SAMPLE_MACHINES);

export function useMachines(): { data: Machine[]; isSample: true } {
  return { data: FLEET, isSample: true };
}

export function useMachine(id: string | undefined): Machine | undefined {
  return FLEET.find((m) => m.id === id);
}

/** Case-insensitive match on fleet number, make/model, site, bench and serial. */
export function searchMachines(machines: Machine[], query: string): Machine[] {
  const q = query.trim().toLowerCase();
  if (!q) return machines;
  return machines.filter((m) =>
    [m.id, m.model, m.make, m.site, m.bench ?? '', m.serial].some((v) =>
      v.toLowerCase().includes(q),
    ),
  );
}

/**
 * Machine id for a scanned or typed asset-tag code: the bare fleet number ("ht-2201") or a URL
 * ending in it (".../machines/HT-2201"). Undefined when it isn't in the fleet.
 */
export function machineIdFromCode(machines: Machine[], code: string): string | undefined {
  const path = code.trim().split(/[?#]/)[0] ?? '';
  const tail = path.split('/').filter(Boolean).pop() ?? '';
  const wanted = tail.toUpperCase();
  return machines.find((m) => m.id.toUpperCase() === wanted)?.id;
}
