import { router, Stack } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { useRole } from '@/auth/useRole';
import { useCases } from '@/features/cases/api';
import { CasesList } from '@/features/cases/CasesList';
import { Text } from '@/components/Text/Text';
import { useTheme } from '@/theme';

/** M11 Support cases, opened from Me (and Home's case links). */
export default function CasesRoute() {
  const query = useCases();
  const { isStaff } = useRole();
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/new-case')}
              accessibilityRole="button"
              accessibilityLabel="New case"
              hitSlop={8}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Plus size={18} color={colors.primaryStrong} strokeWidth={2.25} />
              <Text variant="label" color="primaryStrong">
                New
              </Text>
            </Pressable>
          ),
        }}
      />
      <CasesList
        cases={query.data ?? []}
        loading={query.isPending && !query.error}
        error={query.data ? undefined : query.error}
        onRetry={() => query.refetch()}
        isAdmin={isStaff}
        onOpenCase={(id) => router.push({ pathname: '/case/[id]', params: { id } })}
      />
    </>
  );
}
