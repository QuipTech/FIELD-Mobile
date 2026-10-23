import { router } from 'expo-router';

import { useRole } from '@/auth/useRole';
import { toast } from '@/components';
import { useBrands, useKnowledgeAttention } from '@/features/knowledge/api';
import { useDocsForMyMachines, useRecentDocs } from '@/features/knowledge/personal';
import { KnowledgeHome } from '@/features/knowledge/KnowledgeHome';
import { openDoc } from '@/features/knowledge/navigation';
import { useOfflineLibrary } from '@/features/knowledge/offlineStore';
import { useIsOffline } from '@/lib/network';

export default function KnowledgeRoute() {
  const { capabilities } = useRole();
  const isAdmin = capabilities.isKnowledgeAdmin;
  const offline = useIsOffline();
  const brands = useBrands();
  const recent = useRecentDocs();
  const forMachines = useDocsForMyMachines();
  const attention = useKnowledgeAttention(isAdmin);
  const savedDocs = useOfflineLibrary((s) => s.docs);

  return (
    <KnowledgeHome
      brands={brands.data}
      brandsLoading={brands.isPending && !brands.error}
      brandsError={brands.error}
      onRetry={() => brands.refetch()}
      recent={recent.data ?? []}
      forMachines={forMachines.data}
      attention={isAdmin ? attention.data : undefined}
      isAdmin={isAdmin}
      offline={offline}
      savedDocs={savedDocs}
      onSearch={() => router.push('/knowledge/search')}
      onNotifications={() => router.push('/notifications')}
      // TODO(api): uploads happen in the FIELD console until a mobile upload endpoint exists.
      onUpload={() => toast.show('Upload documents from the FIELD console.')}
      onOpenBrand={(id) => router.push({ pathname: '/knowledge/brand/[id]', params: { id } })}
      onOpenDoc={(id, page) => openDoc(id, page)}
      onOpenReview={() => {
        const first = attention.data?.reviewDocIds[0];
        if (first) openDoc(first);
      }}
    />
  );
}
