import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Filter } from 'lucide-react-native';
import { useState } from 'react';

import { useRole } from '@/auth/useRole';
import { FilterSelect, toast } from '@/components';
import { MachineGate } from '@/features/machines/MachineGate';
import { useMachineRecords } from '@/features/machines/records';
import {
  HISTORY_FILTERS,
  MachineTimeline,
  type HistoryFilter,
} from '@/features/machines/Timelines';

export default function MachineHistoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { history } = useMachineRecords(id);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const { isAdmin } = useRole();

  return (
    <MachineGate id={id}>
      {(machine) => (
        <>
          <Stack.Screen
            options={{
              title: `History · ${machine.label}`,
              headerRight: () => (
                <FilterSelect
                  title="Show"
                  value={filter}
                  options={HISTORY_FILTERS}
                  onChange={setFilter}
                  allValue="all"
                  placeholder="Filter"
                  icon={Filter}
                />
              ),
            }}
          />
          <MachineTimeline
            entries={history}
            filter={filter}
            onAddEntry={() =>
              router.push({ pathname: '/capture', params: { machineId: machine.id } })
            }
            onOpenPhoto={() => toast.show('The photo viewer is coming soon.')}
            // TODO(api): no history export endpoint yet.
            onExport={isAdmin ? () => toast.show('Export is coming soon.') : undefined}
          />
        </>
      )}
    </MachineGate>
  );
}
