import { useLocalSearchParams } from 'expo-router';

import { ModelTree } from '@/features/platformAdmin/library/ModelTree';

export default function ModelTreeRoute() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  return <ModelTree modelId={id} />;
}
