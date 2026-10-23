import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { useKnowledgeSearch } from '@/features/knowledge/api';
import { useFacets } from '@/features/knowledge/catalog';
import { openDoc } from '@/features/knowledge/navigation';
import { SearchScreen } from '@/features/knowledge/SearchScreen';
import type { DocFilters } from '@/features/knowledge/types';

/** Debounce typing so the search endpoint isn't hit on every key. */
function useDebounced(value: string, ms = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function KnowledgeSearchRoute() {
  const params = useLocalSearchParams<{ brand?: string; q?: string }>();
  const [query, setQuery] = useState(params.q ?? '');
  const [filters, setFilters] = useState<DocFilters>({ brandId: params.brand });
  const search = useKnowledgeSearch(useDebounced(query), filters);
  const facets = useFacets(filters.brandId);

  return (
    <SearchScreen
      query={query}
      onQuery={setQuery}
      filters={filters}
      onFilters={setFilters}
      hits={search.data}
      loading={search.isFetching && !search.data}
      error={search.error}
      onRetry={() => search.refetch()}
      brands={facets.data?.brands ?? []}
      categories={facets.data?.categories ?? []}
      models={facets.data?.models ?? []}
      onCancel={() => router.back()}
      onOpenHit={(hit) => openDoc(hit.doc.id, hit.page, hit.sectionId)}
    />
  );
}
