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
