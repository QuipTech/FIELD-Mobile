import { router } from 'expo-router';

import { ScanScreen } from '@/features/camera/ScanScreen';
import { useMachines } from '@/features/machines/api';
import { machineIdFromCode } from '@/features/machines/data';

export default function ScanRoute() {
  const { data = [] } = useMachines();
  return (
    <ScanScreen
      resolve={(code) => machineIdFromCode(data, code)}
      onFound={(id) => router.replace({ pathname: '/machine/[id]', params: { id } })}
      onClose={() => router.back()}
    />
  );
}
