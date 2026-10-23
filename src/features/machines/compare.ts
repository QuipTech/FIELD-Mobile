import type { ConfigChange } from './records';

export type DiffRow = { field: string; before?: string; after?: string };
export type DiffSection = { title: string; rows: DiffRow[] };

/** Snapshot label shown in pickers: newest is the highest version, e.g. "v4 · 12 Mar". */
export const snapshotVersion = (changes: ConfigChange[], id: string) =>
  changes.length - changes.findIndex((c) => c.id === id);

/**
 * Differences between two snapshots (changes newest first). Each change after `fromId` up to
 * and including `toId` becomes a section; "A: x → y" titles become a before/after row.
 * Offline fallback only: screens use the server's field-level diff (`./snapshots`).
 */
export function compareSnapshots(changes: ConfigChange[], fromId: string, toId: string) {
  const from = changes.findIndex((c) => c.id === fromId);
  const to = changes.findIndex((c) => c.id === toId);
  if (from < 0 || to < 0 || from === to) return [];
  const [newer, older] = to < from ? [to, from] : [from, to];
  return changes.slice(newer, older).map((c): DiffSection => {
    const swap = c.title.match(/^(.+?):\s*(.+?)\s*→\s*(.+)$/);
    if (swap) {
      return { title: swap[1]!, rows: [{ field: 'Part no.', before: swap[2], after: swap[3] }] };
    }
    return { title: c.title, rows: [{ field: 'Added', after: c.detail }] };
  });
}
