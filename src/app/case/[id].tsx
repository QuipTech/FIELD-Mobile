import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { SearchX } from 'lucide-react-native';
import { useState } from 'react';

import { initials, useCurrentUser } from '@/auth/useCurrentUser';
import { DetailScreen, EmptyPanel, Pill, toast } from '@/components';
import { CaseDetail } from '@/features/cases/CaseDetail';
import { PRIORITY_TONE, STATUS_LABEL, useCase, type CaseActivity } from '@/features/cases/data';

export default function CaseRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const headerHeight = useHeaderHeight();
  const { data: user } = useCurrentUser();
  const found = useCase(id);
  // TODO(api): post replies to the case and refetch; until then they live on this screen only.
  const [replies, setReplies] = useState<CaseActivity[]>([]);

  if (!found) {
    return (
      <>
        <Stack.Screen options={{ title: 'Case' }} />
        <DetailScreen>
          <EmptyPanel icon={SearchX} title="Case not found" message="It may have been closed." />
        </DetailScreen>
      </>
    );
  }

  const reply = (body: string) =>
    setReplies((prev) => [
      {
        id: `local-${Date.now()}`,
        author: 'You',
        initials: '',
        mine: true,
        at: new Date().toISOString(),
        body,
      },
      ...prev,
    ]);

  return (
    <>
      <Stack.Screen
        options={{
          title: `Case #${found.id}`,
          headerRight: () => (
            <Pill
              label={`${found.priority} · ${STATUS_LABEL[found.status]}`}
              tone={PRIORITY_TONE[found.priority]}
            />
          ),
        }}
      />
      <CaseDetail
        supportCase={{ ...found, activity: [...replies, ...found.activity] }}
        myInitials={user ? initials(user) : ''}
        keyboardOffset={headerHeight}
        onReply={reply}
        onOpenAttachment={() => toast.show('Photo viewer is coming soon.')}
        onOpenMachine={(machineId) =>
          router.push({ pathname: '/machine/[id]', params: { id: machineId } })
        }
      />
    </>
  );
}
