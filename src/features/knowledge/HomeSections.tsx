import { Clock, Info } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';

import { Badge } from '@/components/Badge/Badge';
import { Card } from '@/components/Card/Card';
import { ListRow } from '@/components/ListRow/ListRow';
import { Text } from '@/components/Text/Text';
import { formatRelative } from '@/lib/date';
import { makeStyles, spacing } from '@/theme';
import { RowCard, SectionHeader } from './Parts';
import { DOC_TYPE, type KnowledgeDoc } from './types';

export type RecentItem = { doc: KnowledgeDoc; page?: number; viewedAt: string };

/** K1 "Recently viewed": horizontal cards that reopen at the page last read. */
export function Recent({
  items,
  onOpenDoc,
}: {
  items: RecentItem[];
  onOpenDoc: (id: string, page?: number) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.section}>
      <SectionHeader title="Recently viewed" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.recent}
        style={styles.bleed}
      >
        {items.map(({ doc, page, viewedAt }) => {
          const where = [doc.brandName, page && `p.${page}`, formatRelative(viewedAt)]
            .filter(Boolean)
            .join(' · ');
          return (
            <Card
              key={doc.id}
              onPress={() => onOpenDoc(doc.id, page)}
              accessibilityLabel={`${doc.title}. ${where}`}
              style={styles.recentCard}
            >
              <View style={styles.badges}>
                <Badge label={DOC_TYPE[doc.type].label} tone={DOC_TYPE[doc.type].tone} />
                <Badge label={doc.models[0] ?? ''} />
              </View>
              <Text variant="bodyStrong" numberOfLines={2}>
                {doc.title}
              </Text>
              <Text variant="caption" color="muted">
                {where}
              </Text>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** K1 admin "Needs your attention": documents in review and failed indexing. */
export function Attention({
  inReview,
  failed,
  onOpen,
}: {
  inReview: number;
  failed: KnowledgeDoc[];
  onOpen: () => void;
}) {
  const styles = useStyles();
  if (!inReview && !failed.length) return null;
  return (
    <View style={styles.section}>
      <SectionHeader title="Needs your attention" right="Admin only" />
      <RowCard>
        {inReview > 0 && (
          <ListRow
            icon={Clock}
            title={`${inReview} bulletin${inReview === 1 ? '' : 's'} need${inReview === 1 ? 's' : ''} review`}
            subtitle="Hidden from technicians until approved"
            onPress={onOpen}
            last={!failed.length}
          />
        )}
        {failed.length > 0 && (
          <ListRow
            icon={Info}
            title={`${failed.length} document${failed.length === 1 ? '' : 's'} failed to index`}
            subtitle="Scanned pages need OCR"
            onPress={onOpen}
            last
          />
        )}
      </RowCard>
    </View>
  );
}

const useStyles = makeStyles(() => ({
  section: { gap: spacing.tight },
  bleed: { marginRight: -spacing.md },
  recent: { gap: spacing.tight, paddingRight: spacing.md },
  recentCard: { width: 220, gap: spacing.xs },
  badges: { flexDirection: 'row', gap: 6 },
}));
