import { useLocalSearchParams } from 'expo-router';

import { AdminRoleDetail } from '@/features/platformAdmin/AdminRoles';

export default function AdminRoleRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <AdminRoleDetail id={id} />;
}
