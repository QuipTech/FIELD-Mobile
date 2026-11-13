import { useLocalSearchParams } from 'expo-router';

import { GroupDetail } from '@/features/platformAdmin/groups/GroupDetail';

export default function GroupDetailRoute() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  return <GroupDetail groupId={id} />;
}
