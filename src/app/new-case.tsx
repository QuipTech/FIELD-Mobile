import { router, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';

import { DetailScreen, ErrorState, SkeletonList, toast } from '@/components';
import { useRaiseCase } from '@/features/cases/api';
import { useCaseOptions } from '@/features/cases/options';
import { NewCase } from '@/features/cases/NewCase';
import { errorMessage } from '@/lib/http';

export default function NewCaseRoute() {
  const { machineId } = useLocalSearchParams<{ machineId?: string }>();
  const headerHeight = useHeaderHeight();
  const options = useCaseOptions();
  const raise = useRaiseCase();

  if (!options.data) {
    return (
      <DetailScreen>
        {options.isPending ? (
          <SkeletonList rows={3} />
        ) : (
          <ErrorState error={options.error} onRetry={() => options.refetch()} />
        )}
      </DetailScreen>
    );
  }

  return (
    <NewCase
      machines={options.data.machines}
      categories={options.data.categories}
      initialMachineId={machineId}
      keyboardOffset={headerHeight}
      submitting={raise.isPending}
      onSubmit={(input) =>
        raise.mutate(input, {
          onSuccess: (created) => {
            toast.show(`Case #${created.id} raised.`);
            router.replace({ pathname: '/case/[id]', params: { id: created.id } });
          },
          onError: (error) => toast.show(errorMessage(error)),
        })
      }
    />
  );
}
