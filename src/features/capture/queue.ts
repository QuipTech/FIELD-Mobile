import { useOutbox } from '@/offline/outbox';
import { toEntry, type CaptureDraft } from './store';

const hoursOf = (typed: string) => {
  const n = Number(typed.replace(/[^\d.]/g, ''));
  return typed.trim() && Number.isFinite(n) ? n : undefined;
};

/** `POST /machines/{id}/history` body for a finished draft. */
export function entryBody(draft: CaptureDraft) {
  const operatingHours = hoursOf(draft.hours);
  return {
    entryType: draft.type,
    description: [draft.title.trim(), draft.notes.trim()].filter(Boolean).join('\n\n'),
    ...(operatingHours !== undefined && { operatingHours }),
  };
}

/**
 * Queues the entry and its photos in the outbox: they upload now if online, otherwise when the
 * device reconnects. The entry shows on the machine's timeline straight away as pending.
 */
export function queueEntry(draft: CaptureDraft & { machineId: string }, now = new Date()) {
  const preview = toEntry(draft, now);
  return useOutbox.getState().enqueue({
    kind: 'historyEntry',
    machineId: draft.machineId,
    body: entryBody(draft),
    photos: draft.photos.map((uri, i) => ({
      uri,
      name: `photo-${i + 1}.jpg`,
      type: 'image/jpeg',
    })),
    preview,
  });
}
