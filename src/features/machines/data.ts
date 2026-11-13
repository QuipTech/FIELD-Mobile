import type { PillTone } from '@/components/Pill/Pill';
import { colors } from '@/theme';

export type MachineStatus = 'down' | 'due' | 'ok';
export type MachineRef = {
  /** API id (a UUID for live machines); used for routing, never shown. */
  id: string;
  /** What people call it: the fleet number, else the label or serial, e.g. "HT-2201". */
  label: string;
  model: string;
  status: MachineStatus;
};

export type Machine = MachineRef & {
  make: string;
  site: string;
  /** Where on site, e.g. "Bench 3". */
  bench?: string;
  /** Engine hours. */
  hours?: number;
  serial: string;
  /** Catalogue model id (the Knowledge `model` filter); missing on older APIs. */
  modelId?: string;
  /** Plant ID / asset number, the customer's own fleet number. */
  plantId?: string;
  /** Cover photo (a signed URL that lasts 15 minutes). */
  photoUrl?: string;
  /** From machine detail; undefined in list rows. */
  technicianCount?: number;
  /** Registered (added, not yet activated), active, archived or sold. Undefined on older APIs. */
  lifecycle?: MachineLifecycle;
  /** Machine groups it belongs to (shown as coloured tags). */
  groups?: { id: string; name: string; colour: string | null }[];
};

export type MachineLifecycle = 'registered' | 'active' | 'archived' | 'sold';

/** How each lifecycle state shows on a machine's thumbnail and row. */
export const LIFECYCLE: Record<MachineLifecycle, { label: string; dot: string; tag?: PillTone }> = {
  active: { label: 'Active', dot: colors.success },
  registered: { label: 'Not activated', dot: colors.amber, tag: 'amber' },
  archived: { label: 'Archived', dot: colors.inkSubtle, tag: 'muted' },
  sold: { label: 'Sold', dot: colors.inkSubtle, tag: 'muted' },
};

export const MACHINE_STATUS: Record<
  MachineStatus,
  { label: string; tone: PillTone; fg: string; bg: string }
> = {
  down: { label: 'Down', tone: 'danger', fg: colors.danger, bg: colors.dangerTint },
  due: { label: 'Due', tone: 'amber', fg: colors.amber, bg: colors.amberTint },
  ok: { label: 'Running', tone: 'success', fg: colors.success, bg: colors.successBg },
};

/** Case-insensitive match on fleet number, make/model, site, bench and serial. */
export function searchMachines(machines: Machine[], query: string): Machine[] {
  const q = query.trim().toLowerCase();
  if (!q) return machines;
  return machines.filter((m) =>
    [m.label, m.model, m.make, m.site, m.bench ?? '', m.serial].some((v) =>
      v.toLowerCase().includes(q),
    ),
  );
}

/**
 * Machine id for a scanned or typed asset-tag code: the bare fleet number, label or serial
 * ("ht-2201"), or a URL ending in one of them or in the machine id (".../machines/HT-2201").
 * Undefined when it isn't in the fleet.
 */
export function machineIdFromCode(machines: Machine[], code: string): string | undefined {
  const path = code.trim().split(/[?#]/)[0] ?? '';
  const tail = path.split('/').filter(Boolean).pop() ?? '';
  const wanted = tail.toUpperCase();
  return machines.find((m) => [m.id, m.label, m.serial].some((v) => v.toUpperCase() === wanted))
    ?.id;
}
