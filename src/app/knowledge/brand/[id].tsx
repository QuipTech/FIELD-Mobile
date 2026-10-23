import { router, Stack, useLocalSearchParams } from 'expo-router';

import { useRole } from '@/auth/useRole';
import { ErrorState, Screen, SkeletonList, toast } from '@/components';
import { useBrand } from '@/features/knowledge/api';
import { BrandScreen } from '@/features/knowledge/BrandScreen';

const toKnowledge = { label: 'Go to Knowledge', onPress: () => router.navigate('/knowledge') };

export default function BrandRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isAdmin = useRole().capabilities.isKnowledgeAdmin;
  const query = useBrand(id);
  const data = query.data;

  return (
    <Screen refreshing={query.isRefetching} onRefresh={() => query.refetch()}>
      <Stack.Screen options={{ title: 'Knowledge' }} />
      {query.isPending && !query.error ? (
        <SkeletonList rows={6} withTile />
      ) : !data ? (
        <ErrorState
          error={query.error}
          onRetry={() => query.refetch()}
          noAccessAction={toKnowledge}
        />
      ) : (
        <BrandScreen
          brand={data.brand}
          categories={data.categories}
          isAdmin={isAdmin}
          onSearch={() =>
            router.push({ pathname: '/knowledge/search', params: { brand: data.brand.id } })
          }
          onOpenCategory={(category) =>
            router.push({ pathname: '/knowledge/category/[id]', params: { id: category } })
          }
          // TODO(api): brand access is managed in the FIELD console for now.
          onManage={() => toast.show('Manage brand access from the FIELD console.')}
        />
      )}
    </Screen>
  );
}
