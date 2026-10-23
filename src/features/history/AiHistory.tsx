import { Sparkles, Truck, X } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { BrandCard } from '@/components/BrandCard/BrandCard';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { FilterChip } from '@/components/FilterChip/FilterChip';
import { Pill, type PillTone } from '@/components/Pill/Pill';
import { Segmented } from '@/components/Segmented/Segmented';
import { Text } from '@/components/Text/Text';
import { formatDayRelative } from '@/lib/date';
import { colors } from '@/theme';
import type { AiConversation, ReviewItem, ReviewReason, ReviewStatus } from './data';
import { styles } from './styles';

export type AiHistoryProps = {
  conversations: AiConversation[];
  onOpen: (conversation: AiConversation) => void;
  /** Ask before clearing; the route confirms. */
  onClear: () => void;
  /** Admins also get the review queue of flagged answers. */
  isAdmin?: boolean;
  reviewQueue?: ReviewItem[];
  onOpenReview?: (item: ReviewItem) => void;
};

type HistoryView = 'mine' | 'review';

const REASON: Record<ReviewReason, { label: string; tone: PillTone }> = {
  safety: { label: 'Safety refusal', tone: 'danger' },
  noSource: { label: 'No source', tone: 'amber' },
  markedWrong: { label: 'Marked wrong', tone: 'neutral' },
  lowConfidence: { label: 'Low confidence', tone: 'neutral' },
};

const STATUS: Record<ReviewStatus, string> = {
  unreviewed: 'Unreviewed',
  inReview: 'In review',
  escalated: 'Escalated',
  resolved: 'Resolved',
};
const FILTERS: ReviewStatus[] = ['unreviewed', 'inReview', 'escalated'];

/** M17 AI history: past Ask AI questions, newest first. Admins can switch to the review queue. */
export function AiHistory({
  isAdmin = false,
  reviewQueue = [],
  onOpenReview,
  ...props
}: AiHistoryProps) {
  const [view, setView] = useState<HistoryView>('mine');
  const showReview = isAdmin && view === 'review';
  const open = reviewQueue.filter((r) => r.status !== 'resolved').length;

  const toggle = isAdmin && (
    <Segmented<HistoryView>
      accessibilityLabel="AI history view"
      value={view}
      onChange={setView}
      options={[
        { value: 'mine', label: 'My history' },
        { value: 'review', label: `Review queue · ${open}` },
      ]}
    />
  );

  if (showReview) {
    return (
      <DetailScreen>
        {toggle}
        <ReviewQueue items={reviewQueue} onOpen={onOpenReview} />
      </DetailScreen>
    );
  }
  return <MyHistory {...props} header={toggle} />;
}

function MyHistory({
  conversations,
  onOpen,
  onClear,
  header,
}: Pick<AiHistoryProps, 'conversations' | 'onOpen' | 'onClear'> & { header: ReactNode }) {
  if (conversations.length === 0) {
    return (
      <DetailScreen>
        {header}
        <EmptyPanel
          icon={Sparkles}
          title="No AI conversations yet"
          message="Questions you ask Ask AI appear here so you can pick them up later."
        />
      </DetailScreen>
    );
  }

  return (
    <DetailScreen
      footer={
        <BrandButton
          variant="outline"
          label="Clear AI history"
          icon={<X size={18} color={colors.ink} strokeWidth={2} />}
          onPress={onClear}
        />
      }
    >
      {header}
      {conversations.map((c) => {
        const when = formatDayRelative(c.at);
        return (
          <BrandCard
            key={c.id}
            onPress={() => onOpen(c)}
            accessibilityLabel={`${c.machine ? `${c.machine}, ` : ''}${when}: ${c.question}`}
          >
            <View style={styles.splitRow}>
              {c.machine ? <Pill label={c.machine} tone="brand" icon={Truck} /> : <View />}
              <Text variant="caption" color="inkSubtle">
                {when}
              </Text>
            </View>
            <Text style={styles.question}>{c.question}</Text>
          </BrandCard>
        );
      })}
    </DetailScreen>
  );
}

/** AI4 admin review queue: answers flagged by safety, missing sources or user feedback. */
function ReviewQueue({
  items,
  onOpen,
}: {
  items: ReviewItem[];
  onOpen?: (item: ReviewItem) => void;
}) {
  const [filter, setFilter] = useState<ReviewStatus | null>(null);
  const shown = filter ? items.filter((i) => i.status === filter) : items;

  return (
    <>
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const count = items.filter((i) => i.status === f).length;
          return (
            <FilterChip
              key={f}
              label={count ? `${STATUS[f]} ${count}` : STATUS[f]}
              selected={filter === f}
              onPress={() => setFilter(filter === f ? null : f)}
            />
          );
        })}
      </View>
      {shown.length === 0 ? (
        <EmptyPanel
          icon={Sparkles}
          title="Nothing to review"
          message="Flagged AI answers show here for an admin to check."
        />
      ) : (
        shown.map((item) => {
          const reason = REASON[item.reason];
          const who = [item.author, item.machineId].filter(Boolean).join(' · ');
          const status = item.reviewer
            ? `${STATUS[item.status]} · ${item.reviewer}`
            : STATUS[item.status];
          return (
            <BrandCard
              key={item.id}
              onPress={() => onOpen?.(item)}
              accessibilityLabel={`${item.title}, ${reason.label}, ${who}, ${status}`}
            >
              <Text style={styles.question}>{item.title}</Text>
              <View style={styles.splitRow}>
                <Pill label={reason.label} tone={reason.tone} />
                <Text variant="caption" color="inkSubtle">
                  {who}
                </Text>
              </View>
              <Text variant="caption" color="inkMuted">
                {status}
              </Text>
            </BrandCard>
          );
        })
      )}
    </>
  );
}
