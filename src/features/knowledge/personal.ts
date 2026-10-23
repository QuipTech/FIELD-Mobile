import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { z } from 'zod';

import { http } from '@/lib/http';
import { knowledgeKeys, list } from './api';
import { apiDoc, toDoc } from './schema';

/** The user's own Knowledge: recently opened documents and documents for their machines. */

/** Tells the API the user opened a document or turned a page (feeds "Recent"). */
export function useRecordView(id: string | undefined, page: number) {
  useEffect(() => {
    if (!id) return;
    const t = setTimeout(() => {
      http
        .post('/me/knowledge/recent', { documentId: id, page }, { retry: false })
        .catch(() => undefined);
    }, 800);
    return () => clearTimeout(t);
  }, [id, page]);
}

const recentItem = z.union([
  z
    .object({
      document: apiDoc,
      page: z.number().nullish(),
      lastViewedPage: z.number().nullish(),
      viewedAt: z.string().nullish(),
    })
    .transform((r) => ({
      doc: r.document,
      page: r.lastViewedPage ?? r.page,
      viewedAt: r.viewedAt,
    })),
  apiDoc
    .extend({ lastViewedAt: z.string().nullish(), viewedAt: z.string().nullish() })
    .transform((d) => ({ doc: d, page: d.lastViewedPage, viewedAt: d.lastViewedAt ?? d.viewedAt })),
]);

export function useRecentDocs() {
  return useQuery({
    queryKey: knowledgeKeys.recent,
    queryFn: async () =>
      list(recentItem)
        .parse(await http.get('/me/knowledge/recent'))
        .map((r) => ({ doc: toDoc(r.doc), page: r.page ?? undefined, viewedAt: r.viewedAt ?? '' })),
  });
}

const machineMatch = z
  .object({
    model: z.string().nullish(),
    fleetNumber: z.string().nullish(),
    label: z.string().nullish(),
  })
  .loose();
const forMachineDoc = apiDoc.extend({ matchedMachines: z.array(machineMatch).default([]) });

/** Documents for the user's machines (assigned ones, else the fleet). */
export function useDocsForMyMachines() {
  return useQuery({
    queryKey: knowledgeKeys.forMachines,
    queryFn: async () => {
      const items = list(forMachineDoc).parse(
        await http.get('/me/knowledge/for-my-machines', { query: { pageSize: 5 } }),
      );
      const models = items.flatMap((d) =>
        d.matchedMachines.map((m) => m.model || m.fleetNumber || m.label || ''),
      );
      return {
        models: [...new Set(models.filter(Boolean))].slice(0, 3),
        docs: items.slice(0, 3).map(toDoc),
      };
    },
  });
}
