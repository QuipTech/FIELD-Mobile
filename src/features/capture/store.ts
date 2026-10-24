import type { EntryType, TimelineEntry } from '@/features/machines/records';
import { formatHours } from '@/lib/format';

export type LoggedEntry = TimelineEntry & { machineId: string };

export type CaptureDraft = {
  machineId?: string;
  type: EntryType;
  title: string;
  /** Local photo files from the camera step. */
  photos: string[];
  notes: string;
  /** Hour meter reading as typed. */
  hours: string;
  /** Downtime in hours as typed, e.g. "3.5". */
  downtime: string;
  /** The component the entry is about, if any. */
  componentId?: string;
  /** Repairs only: the component was swapped (the API snapshots the configuration). */
  componentReplaced?: boolean;
};

export const emptyDraft = (initial: Partial<CaptureDraft> = {}): CaptureDraft => ({
  type: 'repair',
  title: '',
  photos: [],
  notes: '',
  hours: '',
  downtime: '',
  ...initial,
});

/** The timeline entry for a finished draft (machine required). */
export function toEntry(
  draft: CaptureDraft & { machineId: string },
  now = new Date(),
): LoggedEntry {
  const hours = Number(draft.hours.replace(/[^\d.]/g, ''));
  const downtime = Number(draft.downtime.replace(/[^\d.]/g, ''));
  const detail = [
    draft.notes.trim(),
    draft.hours.trim() && Number.isFinite(hours) ? `Hour meter ${formatHours(hours)}` : '',
    draft.downtime.trim() && Number.isFinite(downtime) ? `${downtime} h downtime` : '',
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
