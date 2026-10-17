import { create } from 'zustand';

import type { EntryType, TimelineEntry } from '@/features/machines/records';
import { formatHours } from '@/lib/format';

export type LoggedEntry = TimelineEntry & { machineId: string };

type EntryLog = {
  /** Newest first. */
  entries: LoggedEntry[];
  add: (entry: LoggedEntry) => void;
};

/**
 * Entries logged on this device this session; machine history and My machine history show them
 * on top. TODO(api): POST entries (with photo uploads) to the machine log and refetch instead.
 */
export const useEntryLog = create<EntryLog>((set) => ({
  entries: [],
  add: (entry) => set((s) => ({ entries: [entry, ...s.entries] })),
}));

export type CaptureDraft = {
  machineId?: string;
  type: EntryType;
  title: string;
  /** Local photo files from the camera step. */
  photos: string[];
  notes: string;
  /** Hour meter reading as typed. */
  hours: string;
};

export const emptyDraft = (initial: Partial<CaptureDraft> = {}): CaptureDraft => ({
  type: 'repair',
  title: '',
  photos: [],
  notes: '',
  hours: '',
  ...initial,
});

/** The timeline entry for a finished draft (machine required). */
export function toEntry(
  draft: CaptureDraft & { machineId: string },
  now = new Date(),
): LoggedEntry {
  const hours = Number(draft.hours.replace(/[^\d.]/g, ''));
  const detail = [
    draft.notes.trim(),
    draft.hours.trim() && Number.isFinite(hours) ? `Hour meter ${formatHours(hours)}` : '',
  ]
    .filter(Boolean)
    .join(' · ');
  return {
    id: `local-${now.getTime()}`,
    machineId: draft.machineId,
    type: draft.type,
    title: draft.title.trim(),
    detail: detail || undefined,
    at: now.toISOString(),
    by: 'You',
    photos: draft.photos.length || undefined,
    photoUris: draft.photos.length ? draft.photos : undefined,
  };
}
