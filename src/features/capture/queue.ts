import { log } from '@/lib/log';
import { useOutbox } from '@/offline/outbox';
import { toEntry, type CaptureDraft } from './store';

const numberOf = (typed: string) => {
  const n = Number(typed.replace(/[^\d.]/g, ''));
  return typed.trim() && Number.isFinite(n) ? n : undefined;
};

/** `POST /machines/{id}/history` body for a finished draft. */
export function entryBody(draft: CaptureDraft) {
  const hours = numberOf(draft.hours);
  const downtimeHours = numberOf(draft.downtime);
  // The API only records a replacement on a repair against a component.
  const replaced = draft.type === 'repair' && !!draft.componentId && draft.componentReplaced;
  return {
    entryType: draft.type,
    description: [draft.title.trim(), draft.notes.trim()].filter(Boolean).join('\n\n'),
    // The API takes whole hours on the meter; downtime may be fractional.
    ...(hours !== undefined && { operatingHours: Math.round(hours) }),
    ...(downtimeHours !== undefined && { downtimeHours }),
    ...(draft.componentId && { componentId: draft.componentId }),
    ...(replaced && { componentReplaced: true }),
  };
}

export type PhotoBatch = { machineId: string; entryId: string; photos: string[]; note: string };

/** M7: queues photos for an existing history entry, one `entryPhoto` item per photo. */
export function queueEntryPhotos({ machineId, entryId, photos, note }: PhotoBatch) {
  log('capture', `queueing ${photos.length} photo(s) for entry ${entryId} on ${machineId}`);
  const { enqueue } = useOutbox.getState();
  const caption = note.trim();
  return photos.map((uri, i) =>
    enqueue({
      kind: 'entryPhoto',
      machineId,
      entryId,
      photo: { uri, name: `photo-${i + 1}.jpg`, type: 'image/jpeg' },
      ...(i === 0 && caption && { caption }),
    }),
  );
}

/**
 * Queues the entry and its photos in the outbox: they upload now if online, otherwise when the
 * device reconnects. The entry shows on the machine's timeline straight away as pending.
 */
export function queueEntry(draft: CaptureDraft & { machineId: string }, now = new Date()) {
  const preview = toEntry(draft, now);
  log(
    'capture',
    `queueing entry for machine ${draft.machineId} with ${draft.photos.length} photo(s)`,
  );
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
