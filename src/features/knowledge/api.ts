import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { ApiError, http } from '@/lib/http';
import {
  API_STATUS,
  API_TYPE,
  apiBrand,
  apiCategory,
  apiDoc,
  stripMarks,
  toBrand,
  toCategory,
  toDoc,
} from './schema';
import { toPage } from './pageSchema';
import type { DocFilters, DocSort, KnowledgeDoc, SearchHit } from './types';

/**
 * Knowledge library (Backend API Reference §1). Technicians only ever receive live documents;
 * a brand outside the plan is hidden from lists and answers `403` when opened directly.
 */

export const knowledgeKeys = {
  all: ['knowledge'] as const,
  brands: ['knowledge', 'brands'] as const,
  brand: (id: string) => ['knowledge', 'brands', id] as const,
  docs: (f: DocFilters, sort: DocSort) => ['knowledge', 'docs', f, sort] as const,
  search: (q: string, f: DocFilters) => ['knowledge', 'search', q, f] as const,
  doc: (id: string) => ['knowledge', 'doc', id] as const,
  page: (id: string, page: number) => ['knowledge', 'doc', id, 'page', page] as const,
  recent: ['knowledge', 'recent'] as const,
  forMachines: ['knowledge', 'for-my-machines'] as const,
  attention: ['knowledge', 'attention'] as const,
};

const enc = encodeURIComponent;
export const list = <T extends z.ZodType>(item: T) =>
  z.union([z.array(item), z.object({ items: z.array(item) }).transform((r) => r.items)]);

/** Filters as the API's query params. `status` is ignored by the API for technicians. */
const docQuery = (f: DocFilters) => ({
  brandId: f.brandId,
  categoryId: f.categoryId,
  type: f.type && API_TYPE[f.type],
  model: f.model,
  status: f.status && API_STATUS[f.status],
});

export function useBrands() {
  return useQuery({
    queryKey: knowledgeKeys.brands,
    queryFn: async () =>
      list(apiBrand)
        .parse(await http.get('/knowledge/brands'))
        .map(toBrand),
  });
}

const brandDetail = apiBrand.extend({ categories: z.array(apiCategory).default([]) });

export function useBrand(id: string | undefined) {
  return useQuery({
    queryKey: knowledgeKeys.brand(id ?? ''),
    enabled: !!id,
    queryFn: async () => {
      const b = brandDetail.parse(await http.get(`/knowledge/brands/${enc(id!)}`));
      return { brand: toBrand(b), categories: b.categories.map((c) => toCategory(c, b.id)) };
    },
  });
}

export function useDocs(filters: DocFilters, sort: DocSort) {
  return useQuery({
    queryKey: knowledgeKeys.docs(filters, sort),
    queryFn: async () => {
      const query = {
        ...docQuery(filters),
        sort: sort === 'az' ? 'title' : 'newest',
        pageSize: 100,
      };
      return list(apiDoc)
        .parse(await http.get('/knowledge/documents', { query }))
        .map(toDoc);
    },
  });
}

const apiHit = z.object({
  document: apiDoc,
  page: z.number().nullish(),
  sectionId: z.string().nullish(),
  heading: z.string().nullish(),
  snippet: z.string().default(''),
});

/** Full-text search over page content. */
export function useKnowledgeSearch(q: string, filters: DocFilters) {
  const term = q.trim();
  return useQuery({
    queryKey: knowledgeKeys.search(term, filters),
    enabled: term.length >= 2,
    queryFn: async () => {
      const query = { q: term, ...docQuery(filters), pageSize: 50 };
      return list(apiHit)
        .parse(await http.get('/knowledge/search', { query }))
        .map((h): SearchHit => ({
          doc: toDoc(h.document),
          page: h.page ?? undefined,
          sectionId: h.sectionId ?? undefined,
          snippet: stripMarks(h.snippet),
        }));
    },
  });
}

/** Document detail. `404` when hidden or gone, `403` when its brand isn't in the plan. */
export function useKnowledgeDoc(id: string | undefined) {
  return useQuery({
    queryKey: knowledgeKeys.doc(id ?? ''),
    enabled: !!id,
    queryFn: async () => toDoc(apiDoc.parse(await http.get(`/knowledge/documents/${enc(id!)}`))),
  });
}

export function useDocPage(id: string | undefined, page: number, header = '') {
  return useQuery({
    queryKey: knowledgeKeys.page(id ?? '', page),
    enabled: !!id,
    staleTime: 60 * 60_000,
    queryFn: async () =>
      toPage(await http.get(`/knowledge/documents/${enc(id!)}/pages/${page}`), page, header),
  });
}

const attention = z.object({
  items: z.array(z.object({ document: apiDoc, reason: z.string() })).default([]),
  counts: z.record(z.string(), z.number()).nullish(),
});

/** Knowledge admins: documents needing action (review, failed indexing, licences). */
export function useKnowledgeAttention(enabled: boolean) {
  return useQuery({
    queryKey: knowledgeKeys.attention,
    enabled,
    queryFn: async () => {
      const a = attention.parse(await http.get('/admin/knowledge/attention'));
      const reviewing = a.items.filter((i) => i.reason === 'needs_review');
      return {
        inReview: a.counts?.needs_review ?? reviewing.length,
        reviewDocIds: reviewing.map((i) => i.document.id),
        failed: a.items
          .filter((i) => i.reason === 'failed')
          .map((i) => toDoc(i.document)) as KnowledgeDoc[],
      };
    },
  });
}

/** True for a 403 from any knowledge call (show NoAccess, never the item's name). */
export function isForbidden(error: unknown) {
  return error instanceof ApiError && error.isForbidden;
}
