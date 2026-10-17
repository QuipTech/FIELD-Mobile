import { router } from 'expo-router';

import { toast } from '@/components';
import { useMachines } from '@/features/machines/data';
import { MachinesList } from '@/features/machines/MachinesList';
import { useMeData } from '@/features/me/data';

export default function MachinesRoute() {
  const { data, isSample } = useMachines();
  const { data: me } = useMeData();
  return (
    <MachinesList
      machines={data}
      homeSite={me.site}
      isSample={isSample}
      onScan={() => router.push('/scan')}
      onNearMe={() => toast.show('Sorting by distance is coming soon.')}
      onOpenMachine={(id) => router.push({ pathname: '/machine/[id]', params: { id } })}
    />
  );
}
