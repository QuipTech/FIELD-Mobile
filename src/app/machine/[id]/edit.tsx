import { useLocalSearchParams } from 'expo-router';

import { EditMachine } from '@/features/machines/EditMachine';
import { MachineGate } from '@/features/machines/MachineGate';

export default function EditMachineRoute() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  return <MachineGate id={id}>{(machine) => <EditMachine machine={machine} />}</MachineGate>;
}
