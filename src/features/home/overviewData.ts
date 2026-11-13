import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';

/**
 * `GET /admin/overview`: the web portal's admin Overview. Platform admins get every
 * organisation; the API scopes or refuses it for everyone else, so Home hides it on error.
 */

const str = z.string().nullish();

const queueEntry = z
  .object({
    id: z.string(),
    title: z.string(),
    state: z.string(),
    progress: z.number().nullish(),
    pageCount: z.number().nullish(),
    queuePosition: z.number().nullish(),
    errorMessage: str,
    uploadedBy: str,
    uploadedAt: str,
    organisationName: str,
  })
  .loose();
export type QueueEntry = z.infer<typeof queueEntry>;

const adminAction = z
  .object({
    id: z.string(),
    actionLabel: z.string(),
    target: str,
    entityType: str,
    occurredAt: z.string(),
    actor: z.object({ name: z.string() }).nullish(),
  })
  .loose();
export type AdminAction = z.infer<typeof adminAction>;

const overview = z
  .object({
    scope: z
      .object({
        isPlatform: z.boolean().nullish(),
        organisationName: str,
        organisationCount: z.number().default(0),
        siteCount: z.number().default(0),
      })
      .loose()
      .nullish(),
    users: z.object({ active: z.number(), invited: z.number().default(0) }).loose(),
    documents: z
      .object({ indexed: z.number(), searchablePagePercent: z.number().nullish() })
      .loose(),
    assets: z.object({ total: z.number(), modelCount: z.number().default(0) }).loose(),
    ingestionQueue: z.array(queueEntry).default([]),
    latestActions: z.array(adminAction).default([]),
  })
  .loose();
export type AdminOverview = z.infer<typeof overview>;

const plural = (n: number, word: string) =>
  `${n.toLocaleString('en-AU')} ${word}${n === 1 ? '' : 's'}`;

/** "All organisations · 3 organisations · 12 sites", or the admin's own organisation. */
export function scopeLine(o: AdminOverview): string {
  const s = o.scope;
  if (!s) return '';
  return [
    s.isPlatform
      ? `All organisations · ${plural(s.organisationCount, 'organisation')}`
      : s.organisationName,
    plural(s.siteCount, 'site'),
  ]
    .filter(Boolean)
    .join(' · ');
}

export function useAdminOverview(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'overview'],
    enabled,
    retry: false,
    queryFn: async () => overview.parse(await http.get('/admin/overview')),
  });
}
