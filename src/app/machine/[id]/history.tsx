import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Filter } from 'lucide-react-native';
import { useState } from 'react';

import { FilterSelect, toast } from '@/components';
import { MachineNotFound } from '@/features/machines/MachineParts';
import { useMachine } from '@/features/machines/data';
import { useMachineRecords } from '@/features/machines/records';
import {
  HISTORY_FILTERS,
  MachineTimeline,
  type HistoryFilter,
} from '@/features/machines/Timelines';

export default function MachineHistoryRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const machine = useMachine(id);
  const { history } = useMachineRecords(id);
  const [filter, setFilter] = useState<HistoryFilter>('all');
  if (!machine) return <MachineNotFound />;

  return (
    <>
      <Stack.Screen
        options={{
          title: `History · ${machine.id}`,
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
        onAddEntry={() => router.push({ pathname: '/capture', params: { machineId: machine.id } })}
        onOpenPhoto={() => toast.show('The photo viewer is coming soon.')}
      />
    </>
  );
}
