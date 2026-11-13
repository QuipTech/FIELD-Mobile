import { useLocalSearchParams } from 'expo-router';

import { DemoRequestDetail } from '@/features/platformAdmin/DemoRequestDetail';

export default function DemoRequestRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <DemoRequestDetail id={id} />;
}
