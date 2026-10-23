import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';
import type { DiffSection } from './compare';
import type { ConfigChange } from './records';

/** Configuration snapshots, their diff and restore (Backend API Reference §4). */

const enc = encodeURIComponent;
const list = <T extends z.ZodType>(item: T) =>
  z.union([z.array(item), z.object({ items: z.array(item) }).transform((r) => r.items)]);

const apiSnapshot = z
  .object({
    id: z.string(),
    createdAt: z.string(),
    label: z.string().nullish(),
    note: z.string().nullish(),
    reason: z.string().nullish(),
    version: z.number().nullish(),
    isKnownGood: z.boolean().nullish(),
    createdBy: z.object({ name: z.string().nullish() }).loose().nullish(),
  })
  .loose();

export const snapshotKeys = {
  list: (id: string) => ['machines', id, 'snapshots'] as const,
  diff: (id: string, from: string, to: string) => ['machines', id, 'snapshots', from, to] as const,
};

export function toConfigChange(
  s: z.infer<typeof apiSnapshot>,
): ConfigChange & { knownGood: boolean } {
  return {
    id: s.id,
    kind: 'firmware',
    title: s.label || s.note || s.reason || (s.version ? `Snapshot v${s.version}` : 'Snapshot'),
    detail: [s.isKnownGood ? 'Known good' : '', s.createdBy?.name ? `by ${s.createdBy.name}` : '']
      .filter(Boolean)
      .join(' · '),
    at: s.createdAt,
    knownGood: !!s.isKnownGood,
  };
}

/** Snapshots, newest first. */
export function useSnapshots(id: string | undefined) {
  return useQuery({
    queryKey: snapshotKeys.list(id ?? ''),
    enabled: !!id,
    queryFn: async () =>
      list(apiSnapshot)
        .parse(await http.get(`/machines/${enc(id!)}/snapshots`))
        .map(toConfigChange)
        .sort((a, b) => b.at.localeCompare(a.at)),
  });
}

const value = z.union([z.string(), z.number()]).nullish();
const diffRow = z
  .object({
    kind: z.string().nullish(),
    systemName: z.string().nullish(),
    componentName: z.string().nullish(),
    before: z.unknown().optional(),
    after: z.unknown().optional(),
    fields: z.array(z.object({ field: z.string(), before: value, after: value })).default([]),
  })
  .loose();

const FIELD: Record<string, string> = {
  serialNumber: 'Serial no.',
  firmwareVersion: 'Firmware',
  softwareVersion: 'Software',
};
const str = (v: unknown) => (v === null || v === undefined || v === '' ? undefined : String(v));

/** One section per changed component; added / removed components get a single row. */
export function toDiffSections(rows: z.infer<typeof diffRow>[]): DiffSection[] {
  return rows.map((r) => {
    const title = [r.systemName, r.componentName].filter(Boolean).join(' · ') || 'Change';
    if (r.fields.length) {
      return {
        title,
        rows: r.fields.map((f) => ({
          field: FIELD[f.field] ?? f.field,
          before: str(f.before),
          after: str(f.after),
        })),
      };
    }
    const added = r.kind === 'added' || (!r.before && !!r.after);
    return {
      title,
      rows: [
        {
          field: added ? 'Added' : 'Removed',
          ...(added ? { after: 'Installed' } : { before: 'Installed' }),
        },
      ],
    };
  });
}

/** Field-level diff of two snapshots, older → newer. */
export function useSnapshotDiff(id: string | undefined, from: string, to: string) {
  return useQuery({
    queryKey: snapshotKeys.diff(id ?? '', from, to),
    enabled: !!id && !!from && !!to && from !== to,
    queryFn: async () =>
      toDiffSections(
        list(diffRow).parse(
          await http.get(`/machines/${enc(id!)}/snapshots/compare`, { query: { from, to } }),
        ),
      ),
  });
}

/** Restores recorded serial / firmware / software to a snapshot (needs `machine.manage`). */
export function useRestoreSnapshot(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (snapshotId: string) =>
      http.post(`/machines/${enc(id)}/snapshots/${enc(snapshotId)}/restore`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['machines', id] }),
  });
}
