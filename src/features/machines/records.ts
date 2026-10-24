import {
  BookOpen,
  ClipboardList,
  Eye,
  FileText,
  Layers,
  ListChecks,
  SlidersHorizontal,
  TriangleAlert,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';

import { useMemo } from 'react';

import type { PillTone } from '@/components/Pill/Pill';
import { pendingEntries, useOutbox } from '@/offline/outbox';
import { useMachineHistory } from './api';
import { useMachineComponents } from './componentsApi';
import { useMachineManuals } from './manualsApi';
import { useSnapshots } from './snapshots';

type Kind = { label: string; icon: LucideIcon; tone: PillTone };

export type EntryType = 'repair' | 'inspection' | 'fault' | 'service' | 'note';
export const ENTRY_TYPE: Record<EntryType, Kind & { plural: string }> = {
  repair: { label: 'Repair', plural: 'Repairs', icon: Wrench, tone: 'brand' },
  inspection: { label: 'Inspection', plural: 'Inspections', icon: Eye, tone: 'neutral' },
  fault: { label: 'Fault', plural: 'Faults', icon: TriangleAlert, tone: 'amber' },
  service: { label: 'Service', plural: 'Services', icon: ClipboardList, tone: 'neutral' },
  note: { label: 'Note', plural: 'Notes', icon: FileText, tone: 'muted' },
};

export type ConfigKind = 'partSwap' | 'firmware' | 'bulletin';
export const CONFIG_KIND: Record<ConfigKind, Kind> = {
  partSwap: { label: 'Part swap', icon: Layers, tone: 'brand' },
  firmware: { label: 'Firmware', icon: SlidersHorizontal, tone: 'neutral' },
  bulletin: { label: 'Bulletin applied', icon: TriangleAlert, tone: 'amber' },
};

export type ManualKind = 'manual' | 'procedure' | 'bulletin' | 'diagram';
export const MANUAL_KIND: Record<ManualKind, { icon: LucideIcon; warn?: boolean }> = {
  manual: { icon: BookOpen },
  procedure: { icon: ListChecks },
  bulletin: { icon: TriangleAlert, warn: true },
  diagram: { icon: FileText },
};

export type ComponentGroup = {
  id: string;
  name: string;
  count: number;
  /** Shown instead of the count, e.g. a fault code or worn part. */
  issue?: { label: string; tone: 'amber' | 'danger' };
};

/** One component in a system. Most fields are null until the API can record them. */
export type MachineComponent = {
  id: string;
  systemId: string;
  systemName: string;
  name: string;
  /** e.g. "Serviced 3 Oct". */
  caption?: string;
  issue?: ComponentGroup['issue'];
  partNumber?: string;
  serialNumber?: string;
  manufacturer?: string;
  installedAt?: string;
  hoursAtInstall?: number;
  hoursSinceInstall?: number;
  lastServicedAt?: string;
  nextServiceDueHours?: number;
  notes?: string;
};

export type TimelineEntry = {
  id: string;
  type: EntryType;
  title: string;
  detail?: string;
  /** ISO date. */
  at: string;
  /** Who logged it: a name, or "System" for automatic events. */
  by: string;
  photos?: number;
  /** Local photo files for entries captured on this device. */
  photoUris?: string[];
  /** Logged on this device and still waiting to upload. */
  pending?: boolean;
  /** The API refused it; see Offline & sync. */
  failed?: boolean;
};

export type ConfigChange = {
  id: string;
  kind: ConfigKind;
  title: string;
  detail: string;
  at: string;
};

export type MachineManual = {
  id: string;
  kind: ManualKind;
  title: string;
  /** e.g. "Rev 12 · 340 pages". */
  meta: string;
  offline: boolean;
  /** Knowledge document it opens in the document viewer. */
  documentId?: string;
  /** Readable in-app (M7) when set; otherwise it opens in the document viewer. */
  articleId?: string;
};

export type MachineRecords = {
  components: ComponentGroup[];
  history: TimelineEntry[];
  configuration: ConfigChange[];
  manuals: MachineManual[];
};

/** A machine's records: components, history (queued entries first), snapshots and manuals. */
export function useMachineRecords(id: string | undefined): MachineRecords {
  const queued = useOutbox((s) => s.items);
  const components = useMachineComponents(id);
  const history = useMachineHistory(id);
  const snapshots = useSnapshots(id);
  const { manuals } = useMachineManuals(id);
  return useMemo(
    () => ({
      components: components.data ?? [],
      history: [...pendingEntries(queued, id), ...(history.data ?? [])],
      configuration: snapshots.data ?? [],
      manuals,
    }),
    [id, queued, components.data, history.data, snapshots.data, manuals],
  );
}
