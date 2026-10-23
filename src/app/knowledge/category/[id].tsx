import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useRole } from '@/auth/useRole';
import { ErrorState, NoAccess, Screen, SkeletonList } from '@/components';
import { useDocs } from '@/features/knowledge/api';
import { useCategory, useFacets } from '@/features/knowledge/catalog';
import { CategoryScreen } from '@/features/knowledge/CategoryScreen';
import { openDoc } from '@/features/knowledge/navigation';
import type { DocFilters, DocSort, DocStatus } from '@/features/knowledge/types';

const toKnowledge = { label: 'Go to Knowledge', onPress: () => router.navigate('/knowledge') };

export default function CategoryRoute() {
  const params = useLocalSearchParams<{ id: string; model?: string; status?: DocStatus }>();
  const isAdmin = useRole().capabilities.isKnowledgeAdmin;
  const meta = useCategory(params.id);
  const facets = useFacets(meta.data?.brand.id, params.id);
  const [filters, setFilters] = useState<DocFilters>({
    model: params.model,
    status: isAdmin ? params.status : undefined,
  });
  const [sort, setSort] = useState<DocSort>('newest');
  const docs = useDocs({ ...filters, categoryId: params.id }, sort);

  if (meta.isPending && !meta.error) {
    return (
      <Screen>
        <SkeletonList rows={5} />
      </Screen>
    );
  }
  if (!meta.data) {
    return (
      <Screen>
        {meta.error ? (
          <ErrorState
            error={meta.error}
            onRetry={() => meta.refetch()}
            noAccessAction={toKnowledge}
          />
        ) : (
          <NoAccess primaryAction={toKnowledge} />
        )}
      </Screen>
    );
  }
  const { brand, category } = meta.data;
  return (
    <Screen refreshing={docs.isRefetching} onRefresh={() => docs.refetch()}>
      <Stack.Screen options={{ title: category.name }} />
      <CategoryScreen
        brandName={brand.name}
        categoryName={category.name}
        docs={docs.data}
        loading={docs.isPending && !docs.error}
        error={docs.error}
        onRetry={() => docs.refetch()}
        filters={filters}
        onFilters={setFilters}
        sort={sort}
        onSort={setSort}
        models={facets.data?.models ?? []}
        isAdmin={isAdmin}
        onOpenBrand={() =>
          router.navigate({ pathname: '/knowledge/brand/[id]', params: { id: brand.id } })
        }
        onOpenDoc={(doc) => openDoc(doc)}
      />
    </Screen>
  );
}
