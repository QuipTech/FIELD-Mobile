import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { useRole } from '@/auth/useRole';
import { Button, DetailScreen, GroupedList, GroupedRow, NoAccess, Text, toast } from '@/components';
import { useReviewQueue, useUpdateReview } from '@/features/assistant/api';
import type { ReviewStatus } from '@/features/history/data';
import { errorMessage } from '@/lib/http';

const REASON = {
  safety: 'Safety refusal',
  noSource: 'No source',
  markedWrong: 'Marked wrong',
  lowConfidence: 'Low confidence',
} as const;

const STATUS: Record<ReviewStatus, string> = {
  unreviewed: 'Unreviewed',
  inReview: 'In review',
  escalated: 'Escalated',
  resolved: 'Resolved',
};

const ACTIONS: { status: ReviewStatus; label: string }[] = [
  { status: 'inReview', label: 'Start review' },
  { status: 'escalated', label: 'Escalate' },
  { status: 'resolved', label: 'Resolve' },
];

/** Platform admin: one flagged AI answer and its review status. */
export default function AiReviewRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { capabilities } = useRole();
  const queue = useReviewQueue(capabilities.isPlatformAdmin);
  const update = useUpdateReview();
  const item = queue.data?.find((r) => r.id === id);

  if (!capabilities.isPlatformAdmin) return <NoAccess />;
  if (!item) {
    return (
      <DetailScreen>
        <Text color="inkMuted">
          {queue.isPending ? 'Loading…' : 'This item is no longer in the queue.'}
        </Text>
      </DetailScreen>
    );
  }

  const setStatus = (status: ReviewStatus) =>
    update.mutate(
      { id: item.id, status },
      {
        onSuccess: () => {
          toast.show('Review updated.');
          if (status === 'resolved') router.back();
        },
        onError: (e) => toast.show(errorMessage(e)),
      },
    );

  return (
    <DetailScreen
      footer={
        <View style={{ gap: 8 }}>
          {ACTIONS.filter((a) => a.status !== item.status).map((a) => (
            <Button
              key={a.status}
              label={a.label}
              variant={a.status === 'resolved' ? 'primary' : 'secondary'}
              onPress={() => setStatus(a.status)}
              disabled={update.isPending}
            />
          ))}
        </View>
      }
    >
      <Text variant="title" accessibilityRole="header">
        {item.title}
      </Text>
      <GroupedList>
        <GroupedRow label="Reason" value={REASON[item.reason]} />
        <GroupedRow label="Asked by" value={item.author || '—'} />
        {!!item.machineId && <GroupedRow label="Machine" value={item.machineId} />}
        <GroupedRow label="Status" value={STATUS[item.status]} />
      </GroupedList>
    </DetailScreen>
  );
}
