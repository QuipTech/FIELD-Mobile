import { useLocalSearchParams } from 'expo-router';

import { AddMachines } from '@/features/platformAdmin/groups/AddMachines';

export default function AddMachinesRoute() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  return <AddMachines groupId={id} />;
}
