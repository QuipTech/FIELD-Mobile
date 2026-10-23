import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useState } from 'react';
import { View } from 'react-native';

import { initials, useCurrentUser } from '@/auth/useCurrentUser';
import { useRole } from '@/auth/useRole';
import {
  DetailScreen,
  ErrorState,
  OptionSheet,
  Pill,
  SkeletonList,
  Text,
  toast,
} from '@/components';
import {
  useAssignableStaff,
  useCase,
  useCaseThread,
  useSendCaseMessage,
  useUpdateCase,
} from '@/features/cases/api';
import { CaseDetail } from '@/features/cases/CaseDetail';
import { PRIORITY_TONE, STATUS_LABEL } from '@/features/cases/data';
import { styles } from '@/features/cases/styles';
import { errorMessage } from '@/lib/http';

const UNASSIGNED = '__none__';

export default function CaseRoute() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const headerHeight = useHeaderHeight();
  const { data: user } = useCurrentUser();
  const { isStaff } = useRole();
  const found = useCase(id);
  const thread = useCaseThread(id);
  const send = useSendCaseMessage(id);
  const [assigning, setAssigning] = useState(false);

  const c = found.data;
  if (!c) {
    return (
      <>
        <Stack.Screen options={{ title: 'Case' }} />
        <DetailScreen>
          {found.isPending ? (
            <SkeletonList rows={3} />
          ) : (
            <ErrorState error={found.error} onRetry={() => found.refetch()} />
          )}
        </DetailScreen>
      </>
    );
  }

  const post = (internal: boolean) => async (body: string) => {
    try {
      await send.mutateAsync({ body, internal });
    } catch (error) {
      toast.show(errorMessage(error));
      throw error;
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: `Case #${c.id}`,
          headerRight: () => (
            <View style={styles.headerRight}>
              {isStaff && (
                <Text
                  variant="label"
                  color="primaryStrong"
                  onPress={() => setAssigning(true)}
                  accessibilityRole="button"
                >
                  Assign
                </Text>
              )}
              <Pill
                label={`${c.priority} · ${STATUS_LABEL[c.status]}`}
                tone={PRIORITY_TONE[c.priority]}
              />
            </View>
          ),
        }}
      />
      <CaseDetail
        supportCase={{ ...c, activity: thread.data ?? [] }}
        myInitials={user ? initials(user) : ''}
        keyboardOffset={headerHeight}
        isAdmin={isStaff}
        onReply={post(false)}
        onInternalNote={post(true)}
        onOpenAttachment={() => toast.show('Photo viewer is coming soon.')}
        onOpenMachine={(machineId) =>
          router.push({ pathname: '/machine/[id]', params: { id: machineId } })
        }
      />
      {isStaff && <AssignSheet id={c.id} visible={assigning} onClose={() => setAssigning(false)} />}
    </>
  );
}

/** Staff: assign the case to someone, or unassign it. */
function AssignSheet({
  id,
  visible,
  onClose,
}: {
  id: string;
  visible: boolean;
  onClose: () => void;
}) {
  const update = useUpdateCase(id);
  const staff = useAssignableStaff(visible);
  const assign = (assigneeId: string | undefined) =>
    update.mutate(
      { assigneeId: !assigneeId || assigneeId === UNASSIGNED ? null : assigneeId },
      { onError: (error) => toast.show(errorMessage(error)) },
    );
  return (
    <OptionSheet<string>
      title={visible ? 'Assign case' : undefined}
      options={[
        { value: UNASSIGNED, label: 'Unassigned' },
        ...(staff.data ?? []).map((s) => ({ value: s.id, label: s.name })),
      ]}
      value={undefined}
      onChange={assign}
      onClose={onClose}
    />
  );
}
