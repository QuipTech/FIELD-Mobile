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
import { useEntryLog } from '@/features/capture/store';
import { sampleRecords } from './sampleRecords';

type Kind = { label: string; icon: LucideIcon; tone: PillTone };

export type EntryType = 'repair' | 'inspection' | 'fault' | 'service';
export const ENTRY_TYPE: Record<EntryType, Kind & { plural: string }> = {
  repair: { label: 'Repair', plural: 'Repairs', icon: Wrench, tone: 'brand' },
  inspection: { label: 'Inspection', plural: 'Inspections', icon: Eye, tone: 'neutral' },
  fault: { label: 'Fault', plural: 'Faults', icon: TriangleAlert, tone: 'amber' },
  service: { label: 'Service', plural: 'Services', icon: ClipboardList, tone: 'neutral' },
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
  /** Readable in-app (M7) when set; otherwise it opens in the document viewer. */
  articleId?: string;
};

export type MachineRecords = {
  components: ComponentGroup[];
  history: TimelineEntry[];
  configuration: ConfigChange[];
  manuals: MachineManual[];
};

/** A machine's records, with entries logged on this device (Capture) on top of its history. */
export function useMachineRecords(id: string | undefined): MachineRecords {
  const logged = useEntryLog((s) => s.entries);
  return useMemo(() => {
    const base = sampleRecords(id);
    const mine = logged.filter((e) => e.machineId === id);
    return mine.length > 0 ? { ...base, history: [...mine, ...base.history] } : base;
  }, [id, logged]);
}
