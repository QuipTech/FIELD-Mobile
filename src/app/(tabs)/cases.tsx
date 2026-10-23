import { router } from 'expo-router';

import { useRole } from '@/auth/useRole';
import { useCases } from '@/features/cases/api';
import { CasesList } from '@/features/cases/CasesList';

export default function CasesRoute() {
  const query = useCases();
  const { isStaff } = useRole();
  return (
    <CasesList
      cases={query.data ?? []}
      loading={query.isPending && !query.error}
      error={query.data ? undefined : query.error}
      onRetry={() => query.refetch()}
      isAdmin={isStaff}
      onNewCase={() => router.push('/new-case')}
      onOpenCase={(id) => router.push({ pathname: '/case/[id]', params: { id } })}
    />
  );
}
