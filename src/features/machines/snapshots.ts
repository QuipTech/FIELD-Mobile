import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { downloadAndShare } from '@/lib/files';
import { http } from '@/lib/http';
import { machineKeys } from './api';
import type { ConfigChange } from './records';

/** Configuration snapshots: list, take, known good, diff, export and restore. */

const enc = encodeURIComponent;

export const SNAPSHOT_TRIGGERS = [
  'manual',
  'scheduled',
  'service',
  'component_replaced',
  'baseline',
] as const;
export type SnapshotTrigger = (typeof SNAPSHOT_TRIGGERS)[number];
export const TRIGGER_LABEL: Record<SnapshotTrigger, string> = {
  manual: 'Manual snapshot',
  scheduled: 'Scheduled',
  service: 'After a service',
  component_replaced: 'Component replaced',
  baseline: 'Baseline',
};

const snapshot = z.object({
  id: z.string(),
  takenAt: z.string(),
  takenBy: z
    .object({ id: z.string(), name: z.string(), avatarUrl: z.string().nullable().default(null) })
    .nullable()
    .default(null),
  trigger: z.enum(SNAPSHOT_TRIGGERS).catch('manual'),
  isKnownGood: z.boolean().default(false),
});
export type Snapshot = z.infer<typeof snapshot>;

const diffRow = z.object({
  kind: z.enum(['changed', 'added', 'removed']),
  componentName: z.string(),
  before: z.string().nullable(),
  after: z.string().nullable(),
});
export type SnapshotDiffRow = z.infer<typeof diffRow>;
const snapshotDiff = z.object({
  from: snapshot,
  to: snapshot,
  rows: z.array(diffRow).default([]),
  unchanged: z
    .array(z.object({ componentName: z.string(), value: z.string().nullable() }))
    .default([]),
});
export type SnapshotDiff = z.infer<typeof snapshotDiff>;

export const snapshotKeys = {
  list: (id: string) => ['machines', id, 'snapshots'] as const,
  diff: (id: string, from: string, to: string) => ['machines', id, 'snapshots', from, to] as const,
};

/** For the Configuration tab preview on machine detail. */
export function toConfigChange(s: Snapshot): ConfigChange {
  return {
    id: s.id,
    kind: s.trigger === 'component_replaced' ? 'partSwap' : 'firmware',
    title: TRIGGER_LABEL[s.trigger],
    detail: [s.isKnownGood ? 'Known good' : '', s.takenBy?.name ?? 'System']
      .filter(Boolean)
      .join(' · '),
    at: s.takenAt,
  };
}

/** Snapshots, newest first. */
export function useSnapshots(id: string | undefined) {
  return useQuery({
    queryKey: snapshotKeys.list(id ?? ''),
    enabled: !!id,
    queryFn: async () =>
      z
        .array(snapshot)
        .parse(await http.get(`/machines/${enc(id!)}/snapshots`))
        .sort((a, b) => b.takenAt.localeCompare(a.takenAt)),
  });
}

/** Older snapshot first, whichever order they were picked in. */
export function orderPair(snapshots: Snapshot[], a: string, b: string): [string, string] {
  const at = (id: string) => snapshots.find((s) => s.id === id)?.takenAt ?? '';
  return at(a) <= at(b) ? [a, b] : [b, a];
}

export function useSnapshotDiff(id: string, from: string, to: string) {
  return useQuery({
    queryKey: snapshotKeys.diff(id, from, to),
    enabled: !!from && !!to && from !== to,
    queryFn: async () =>
      snapshotDiff.parse(
        await http.get(`/machines/${enc(id)}/snapshots/diff`, { query: { from, to } }),
      ),
  });
}

/** Downloads the diff as CSV or PDF (with the auth header) and opens the share sheet. */
export function exportSnapshotDiff(id: string, from: string, to: string, format: 'csv' | 'pdf') {
  const query = new URLSearchParams({ from, to, format }).toString();
  return downloadAndShare(`/machines/${enc(id)}/snapshots/diff/export?${query}`, {
    auth: true,
    mimeType: format === 'pdf' ? 'application/pdf' : 'text/csv',
  });
}

/** Take snapshot, mark known good and restore; each reloads the list (restore: components too). */
export function useSnapshotActions(id: string) {
  const client = useQueryClient();
  const reload = () => client.invalidateQueries({ queryKey: snapshotKeys.list(id) });
  return {
    take: useMutation({
      mutationFn: () => http.post(`/machines/${enc(id)}/snapshots`, undefined, { retry: false }),
      onSettled: reload,
    }),
    knownGood: useMutation({
      mutationFn: ({ snapshotId, isKnownGood }: { snapshotId: string; isKnownGood: boolean }) =>
        http.patch(`/machines/${enc(id)}/snapshots/${enc(snapshotId)}`, { isKnownGood }),
      onSettled: reload,
    }),
    restore: useMutation({
      mutationFn: (snapshotId: string) =>
        http.post(`/machines/${enc(id)}/snapshots/${enc(snapshotId)}/restore`, undefined, {
          retry: false,
        }),
      onSettled: () => client.invalidateQueries({ queryKey: machineKeys.one(id) }),
    }),
  };
}
