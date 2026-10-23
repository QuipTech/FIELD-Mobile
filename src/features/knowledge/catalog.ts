import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';
import { apiCategory, toCategory } from './schema';

const named = z.object({ id: z.string(), name: z.string() }).loose();
const modelName = z.union([z.string(), z.object({ name: z.string() }).transform((m) => m.name)]);

const categoryDetail = apiCategory.extend({ brand: named, models: z.array(modelName).default([]) });

/** The category and its brand. `403` when its brand isn't in the plan. */
export function useCategory(id: string | undefined) {
  return useQuery({
    queryKey: ['knowledge', 'category', id ?? ''],
    enabled: !!id,
    queryFn: async () => {
      const c = categoryDetail.parse(
        await http.get(`/knowledge/categories/${encodeURIComponent(id!)}`),
      );
      return {
        category: toCategory(c, c.brand.id),
        brand: { id: c.brand.id, name: c.brand.name },
        models: c.models,
      };
    },
  });
}

const facets = z.object({
  brands: z.array(named).default([]),
  categories: z.array(named).default([]),
  models: z.array(modelName).default([]),
});

/** Options for the filter chips; `brandId` / `categoryId` narrow them. */
export function useFacets(brandId?: string, categoryId?: string) {
  return useQuery({
    queryKey: ['knowledge', 'facets', brandId ?? '', categoryId ?? ''],
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const f = facets.parse(
        await http.get('/knowledge/facets', { query: { brandId, categoryId } }),
      );
      return {
        brands: f.brands.map((b) => ({ id: b.id, name: b.name })),
        categories: f.categories.map((c) => ({ id: c.id, name: c.name })),
        models: [...new Set(f.models)].sort(),
      };
    },
  });
}
