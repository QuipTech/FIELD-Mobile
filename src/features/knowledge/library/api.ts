import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';

/** Knowledge library (same documents as the web portal) and the article reader. */

const enc = encodeURIComponent;

export const LIBRARY_TYPES = [
  'guide',
  'knownIssue',
  'manual',
  'bulletin',
  'procedure',
  'policy',
  'parts_book',
] as const;
export type LibraryType = (typeof LIBRARY_TYPES)[number];

export type LibrarySort = 'relevance' | 'newest';
export type LibraryFilters = {
  search?: string;
  type?: LibraryType;
  brandId?: string;
  categoryId?: string;
  make?: string;
  model?: string;
  sort?: LibrarySort;
};

const knowledgeResult = z.object({
  id: z.string(),
  title: z.string(),
  type: z.string(),
  snippet: z.string().nullable().default(null),
  highlights: z.array(z.string()).optional(),
  page: z.number().nullable().default(null),
  heading: z.string().nullable().default(null),
  sectionId: z.string().nullable().default(null),
  models: z.array(z.string()).default([]),
  source: z.enum(['shared', 'organisation']).catch('organisation'),
  sourceOem: z.string().nullable().default(null),
  versionNumber: z.number(),
  updatedAt: z.string(),
});
export type KnowledgeResult = z.infer<typeof knowledgeResult>;

const named = z.object({ id: z.string(), name: z.string() });
const libraryPage = z.object({
  items: z.array(knowledgeResult),
  total: z.number(),
  searchMode: z.enum(['semantic', 'keyword', 'browse']).catch('browse'),
  makes: z.array(named).default([]),
  activeModel: named.nullable().default(null),
});
export type LibraryPage = z.infer<typeof libraryPage>;

const libraryBrand = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().default(''),
  description: z.string().nullish(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().default(0),
  logoUrl: z.string().nullable().default(null),
  documentCount: z.number().default(0),
});
export type LibraryBrand = z.infer<typeof libraryBrand>;

const libraryCategory = z.object({
  id: z.string(),
  brandId: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  slug: z.string(),
  sortOrder: z.number().default(0),
});
export type LibraryCategory = z.infer<typeof libraryCategory>;

const knowledgeModel = z.object({ id: z.string(), displayName: z.string() });
export type KnowledgeModel = z.infer<typeof knowledgeModel>;

export const PAGE_SIZE = 20;

export const libraryKeys = {
  all: ['knowledge', 'library'] as const,
  list: (f: LibraryFilters) => ['knowledge', 'library', 'list', f] as const,
  brands: ['knowledge', 'library', 'brands'] as const,
  categories: (brandId: string) => ['knowledge', 'library', 'categories', brandId] as const,
  models: ['knowledge', 'library', 'models'] as const,
  article: (id: string) => ['knowledge', 'article', id] as const,
};

/** Only the params that are set; sort only matters while searching. */
export function libraryQuery(f: LibraryFilters, page: number) {
  const search = f.search?.trim().slice(0, 500);
  return {
    ...(search && { search, sort: f.sort ?? 'relevance' }),
    ...(!search && { sort: 'newest' }),
    ...(f.type && { type: f.type }),
    ...(f.brandId && { brandId: f.brandId }),
    ...(f.categoryId && { categoryId: f.categoryId }),
    ...(f.make && { make: f.make }),
    ...(f.model && { model: f.model }),
    page,
    pageSize: PAGE_SIZE,
  };
}

/**
 * The list, 20 at a time. A change of filters starts a new query and aborts the old one, so a
 * late response can never overwrite newer results.
 */
export function useLibrary(filters: LibraryFilters) {
  return useInfiniteQuery({
    queryKey: libraryKeys.list(filters),
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam, signal }) =>
      libraryPage.parse(
        await http.get('/knowledge/library', { query: libraryQuery(filters, pageParam), signal }),
      ),
    getNextPageParam: (last, pages) => {
      const loaded = pages.reduce((n, p) => n + p.items.length, 0);
      return loaded < last.total && last.items.length > 0 ? pages.length + 1 : undefined;
    },
  });
}

export function useLibraryBrands() {
  return useQuery({
    queryKey: libraryKeys.brands,
    staleTime: 5 * 60_000,
    queryFn: async () =>
      z
        .array(libraryBrand)
        .parse(await http.get('/knowledge/brands'))
        .filter((b) => b.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
  });
}

export type FolderOption = { id: string; label: string };

/** Nested folders flattened depth-first by sortOrder, labelled "Parent › Child". */
export function flattenFolders(categories: LibraryCategory[]): FolderOption[] {
  const byParent = new Map<string | null, LibraryCategory[]>();
  for (const c of categories) {
    const key = c.parentId && categories.some((p) => p.id === c.parentId) ? c.parentId : null;
    byParent.set(key, [...(byParent.get(key) ?? []), c]);
  }
  const out: FolderOption[] = [];
  const walk = (parent: string | null, trail: string[]) => {
    const kids = [...(byParent.get(parent) ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    );
    for (const c of kids) {
      const path = [...trail, c.name];
      out.push({ id: c.id, label: path.join(' › ') });
      if (path.length < 8) walk(c.id, path);
    }
  };
  walk(null, []);
  return out;
}

export function useBrandFolders(brandId: string | undefined) {
  return useQuery({
    queryKey: libraryKeys.categories(brandId ?? ''),
    enabled: !!brandId,
    staleTime: 5 * 60_000,
    queryFn: async () =>
      flattenFolders(
        z
          .array(libraryCategory)
          .parse(await http.get(`/knowledge/brands/${enc(brandId!)}/categories`)),
      ),
  });
}

export function useKnowledgeModels() {
  return useQuery({
    queryKey: libraryKeys.models,
    staleTime: 30 * 60_000,
    queryFn: async () => z.array(knowledgeModel).parse(await http.get('/knowledge/models')),
  });
}
