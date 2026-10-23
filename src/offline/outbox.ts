import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { TimelineEntry } from '@/features/machines/records';
import { uuid } from '@/lib/id';

/**
 * Writes queued on this device until they reach the API (Backend API Reference §6, "Offline
 * write queue"). Each item's `id` is its `Idempotency-Key`: made once when queued and reused on
 * every retry, so a dropped connection never creates duplicates. Items are sent in order.
 */

export type OutboxPhoto = { uri: string; name: string; type: string };

export type OutboxItem = {
  /** Also the `Idempotency-Key`. */
  id: string;
  createdAt: string;
  attempts: number;
  /** Set when the API refused the write (400/403/404): shown to the user, not retried. */
  error?: string;
} & (
  | {
      kind: 'historyEntry';
      machineId: string;
      body: Record<string, unknown>;
      /** Local files; each becomes its own `entryPhoto` item once the entry has its real id. */
      photos: OutboxPhoto[];
      /** What the timeline shows until the entry syncs. */
      preview: TimelineEntry;
    }
  | { kind: 'entryPhoto'; machineId: string; entryId: string; photo: OutboxPhoto }
  | { kind: 'caseMessage'; caseId: string; staff: boolean; body: Record<string, unknown> }
);

type NewItem = DistributiveOmit<OutboxItem, 'id' | 'createdAt' | 'attempts' | 'error'>;
type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

type OutboxState = {
  items: OutboxItem[];
  enqueue: (item: NewItem, id?: string) => string;
  remove: (id: string) => void;
  /** Replaces an item with follow-ups in its place (keeps the queue order). */
  replace: (id: string, next: NewItem[]) => void;
  update: (id: string, patch: Partial<Pick<OutboxItem, 'attempts' | 'error'>>) => void;
  clear: () => void;
};

const make = (item: NewItem, id = uuid()): OutboxItem =>
  ({ ...item, id, createdAt: new Date().toISOString(), attempts: 0 }) as OutboxItem;

export const useOutbox = create<OutboxState>()(
  persist(
    (set) => ({
      items: [],
      enqueue: (item, id) => {
        const next = make(item, id);
        set((s) => ({ items: [...s.items, next] }));
        return next.id;
      },
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      replace: (id, next) =>
        set((s) => ({
          items: s.items.flatMap((i) => (i.id === id ? next.map((n) => make(n)) : [i])),
        })),
      update: (id, patch) =>
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, ...patch } : i)) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'field.outbox', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

/** Writes still to upload, including refused ones the user hasn't dismissed. */
export const usePendingCount = () => useOutbox((s) => s.items.length);

/** Entries logged on this device that haven't synced yet, newest first. */
export function pendingEntries(items: OutboxItem[], machineId?: string) {
  return items
    .flatMap((i) =>
      i.kind === 'historyEntry' && (!machineId || i.machineId === machineId)
        ? [{ ...i.preview, machineId: i.machineId, pending: true, failed: !!i.error }]
        : [],
    )
    .reverse();
}
