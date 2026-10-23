import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { z } from 'zod';

import { apiDoc, toDoc } from '@/features/knowledge/schema';
import { toast } from '@/components/Toast/store';
import { openDoc } from '@/features/knowledge/navigation';
import { useOfflineLibrary } from '@/features/knowledge/offlineStore';
import { http } from '@/lib/http';
import type { MachineManual, ManualKind } from './records';

const enc = encodeURIComponent;
const list = <T extends z.ZodType>(item: T) =>
  z.union([z.array(item), z.object({ items: z.array(item) }).transform((r) => r.items)]);

const KIND: Record<string, ManualKind> = {
  manual: 'manual',
  bulletin: 'bulletin',
  guide: 'procedure',
  knownIssue: 'procedure',
};

/** Live Knowledge documents linked to the machine's model. */
export function useMachineManuals(id: string | undefined) {
  const saved = useOfflineLibrary((s) => s.docs);
  const query = useQuery({
    queryKey: ['machines', id ?? '', 'manuals'],
    enabled: !!id,
    queryFn: async () =>
      list(apiDoc)
        .parse(await http.get(`/machines/${enc(id!)}/manuals`, { query: { pageSize: 50 } }))
        .map(toDoc),
  });
  const manuals = useMemo(
    () =>
      (query.data ?? []).map((d): MachineManual => ({
        id: d.id,
        kind: KIND[d.type] ?? 'manual',
        title: d.title,
        meta: `Rev ${d.version} · ${d.pageCount} page${d.pageCount === 1 ? '' : 's'}`,
        offline: saved.some((s) => s.id === d.id),
        documentId: d.id,
      })),
    [query.data, saved],
  );
  return { ...query, manuals, docs: query.data ?? [] };
}

const technician = z.object({
  id: z.string(),
  name: z.string().nullish(),
  avatarUrl: z.string().nullish(),
  assignedAt: z.string().nullish(),
});
export type Technician = { id: string; name: string; avatarUrl?: string };

/** Technicians assigned to the machine. */
export function useMachineTechnicians(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['machines', id ?? '', 'technicians'],
    enabled: !!id && enabled,
    queryFn: async () =>
      list(technician)
        .parse(await http.get(`/machines/${enc(id!)}/technicians`))
        .map((t): Technician => ({
          id: t.id,
          name: t.name || 'Technician',
          avatarUrl: t.avatarUrl ?? undefined,
        })),
  });
}

/** Assign (`userId`) or unassign (`remove`) a technician. Needs `machine.manage`. */
export function useAssignTechnician(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, remove }: { userId: string; remove?: boolean }) =>
      remove
        ? http.delete(`/machines/${enc(id)}/technicians/${enc(userId)}`)
        : http.post(`/machines/${enc(id)}/technicians`, { userId }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['machines', id] }),
  });
}

/** Open a manual in the document viewer, or save it to / remove it from this device. */
export function useManualActions(id: string | undefined) {
  const { docs } = useMachineManuals(id);
  const toggle = useOfflineLibrary((s) => s.toggle);
  return {
    onOpenManual: (manual: MachineManual) => openDoc(manual.documentId ?? manual.id),
    onDownloadManual: (manual: MachineManual) => {
      const doc = docs.find((d) => d.id === manual.documentId);
      if (!doc) return;
      toggle(doc);
      toast.show(manual.offline ? 'Removed from this device.' : 'Saved for offline use.');
    },
  };
}
