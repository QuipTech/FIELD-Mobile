import { router } from 'expo-router';
import { Alert } from 'react-native';

import { useRole } from '@/auth/useRole';
import { DetailScreen, ErrorState, SkeletonList, toast } from '@/components';
import {
  useAiConversations,
  useClearConversations,
  useReviewQueue,
} from '@/features/assistant/api';
import { AiHistory } from '@/features/history/AiHistory';
import { errorMessage } from '@/lib/http';

export default function AiHistoryRoute() {
  const { capabilities } = useRole();
  const conversations = useAiConversations();
  const reviewQueue = useReviewQueue(capabilities.isPlatformAdmin);
  const clear = useClearConversations();

  const confirmClear = () =>
    Alert.alert('Clear AI history?', 'This removes all your past Ask AI conversations.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => clear.mutate(undefined, { onError: (e) => toast.show(errorMessage(e)) }),
      },
    ]);

  if (!conversations.data) {
    return (
      <DetailScreen>
        {conversations.isPending ? (
          <SkeletonList rows={4} />
        ) : (
          <ErrorState error={conversations.error} onRetry={() => conversations.refetch()} />
        )}
      </DetailScreen>
    );
  }

  return (
    <AiHistory
      conversations={conversations.data}
      onOpen={(c) => router.navigate({ pathname: '/ask-ai', params: { conversation: c.id } })}
      onClear={confirmClear}
      isAdmin={capabilities.isPlatformAdmin}
      reviewQueue={reviewQueue.data ?? []}
      onOpenReview={(item) => router.push({ pathname: '/ai-review/[id]', params: { id: item.id } })}
    />
  );
}
