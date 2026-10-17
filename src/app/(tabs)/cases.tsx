import { router } from 'expo-router';

import { toast } from '@/components';
import { CasesList } from '@/features/cases/CasesList';
import { useCases } from '@/features/cases/data';

export default function CasesRoute() {
  const { data, isSample } = useCases();
  return (
    <CasesList
      cases={data}
      isSample={isSample}
      onNewCase={() => toast.show('Raising new cases is coming soon.')}
      onOpenCase={(id) => router.push({ pathname: '/case/[id]', params: { id } })}
    />
  );
}
