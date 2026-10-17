import { CloudDownload, LifeBuoy } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { FilterChip } from '@/components/FilterChip/FilterChip';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import type { FaqArticle } from './data';
import { styles } from './styles';

export type FaqArticleViewProps = {
  article: FaqArticle;
  onContactSupport: () => void;
  onFeedback: (helpful: boolean) => void;
};

/** M15 Help article: answer, optional tip, "Was this helpful?" and a route to support. */
export function FaqArticleView({ article, onContactSupport, onFeedback }: FaqArticleViewProps) {
  const [vote, setVote] = useState<boolean | null>(null);
  const answer = (helpful: boolean) => {
    if (vote !== null) return;
    setVote(helpful);
    onFeedback(helpful);
  };

  return (
    <DetailScreen
      footer={
        <BrandButton
          label="Still need help? Contact support"
          icon={<LifeBuoy size={18} color={colors.onAccent} strokeWidth={2} />}
          onPress={onContactSupport}
        />
      }
    >
      <Text style={styles.articleTitle} accessibilityRole="header">
        {article.question}
      </Text>
      {article.paragraphs.map((p, i) => (
        <Text key={i} color="inkMuted" style={styles.paragraph}>
          {p}
        </Text>
      ))}
      {article.tip && (
        <View style={styles.tip}>
          <CloudDownload size={18} color={colors.brand} strokeWidth={2} />
          <Text color="brand" style={styles.tipText}>
            {article.tip}
          </Text>
        </View>
      )}

      <View style={styles.feedback}>
        <Text variant="caption" color="inkMuted">
          Was this helpful?
        </Text>
        <FilterChip label="Yes" selected={vote === true} onPress={() => answer(true)} />
        <FilterChip label="No" selected={vote === false} onPress={() => answer(false)} />
      </View>
      {vote !== null && (
        <Text
          variant="caption"
          color="inkMuted"
          style={styles.thanks}
          accessibilityLiveRegion="polite"
        >
          {vote ? 'Thanks for letting us know.' : 'Thanks — we’ll use this to improve the answer.'}
        </Text>
      )}
    </DetailScreen>
  );
}
