import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { ApiError, http } from '@/lib/http';
import { libraryKeys } from './api';

/** The article reader, download links and delete (`/documents/:id`). */

const enc = encodeURIComponent;

const figure = z.object({
  page: z.number().nullable().default(null),
  caption: z.string().default(''),
  imageUrl: z.string().nullable().default(null),
});
const articleSection = z.object({
  id: z.string(),
  heading: z.string().nullable().default(null),
  page: z.number().nullable().default(null),
  content: z.string().default(''),
  figures: z.array(figure).default([]),
});
const article = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  machineMake: z.string().nullable().default(null),
  machineModel: z.string().nullable().default(null),
  revision: z.union([z.string(), z.number()]).nullable().default(null),
  pageCount: z.number().nullable().default(null),
  source: z.enum(['tenant', 'quiptech_library']).catch('tenant'),
  state: z.string(),
  fileName: z.string().nullable().default(null),
  /** View link; valid 15 minutes. */
  pdfUrl: z.string().nullable().default(null),
  summary: z.string().nullable().default(null),
  sections: z.array(articleSection).default([]),
  related: z
    .array(
      z.object({ id: z.string(), title: z.string(), type: z.string(), page: z.number().nullish() }),
    )
    .default([]),
  appliesBulletins: z.array(z.object({ id: z.string(), title: z.string() })).default([]),
});
export type Article = z.infer<typeof article>;
export type ArticleSection = Article['sections'][number];
export type ArticleFigure = ArticleSection['figures'][number];

/** The reader. Short-lived: its pdfUrl and figure URLs are signed for 15 minutes. */
export function useArticle(id: string) {
  return useQuery({
    queryKey: libraryKeys.article(id),
    staleTime: 0,
    gcTime: 10 * 60_000,
    retry: (count, e) => count < 2 && !(e instanceof ApiError && e.status < 500),
    queryFn: async () => article.parse(await http.get(`/documents/${enc(id)}/article`)),
  });
}

/** A fresh signed download URL; fetched right before every use, never cached. */
export async function fetchDownloadUrl(id: string): Promise<string> {
  return z.object({ url: z.string() }).parse(await http.get(`/documents/${enc(id)}/download`)).url;
}

export function useDeleteDocument() {
  return useMutation({
    mutationFn: (id: string) => http.delete(`/documents/${enc(id)}`, { retry: false }),
  });
}
