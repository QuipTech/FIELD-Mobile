import { Check, Image as ImageIcon, Sparkles, TriangleAlert } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { colors, fontFamily, spacing } from '@/theme';
import type { ArticleBlock, KnowledgeArticle } from './data';

export type ArticleViewProps = {
  article: KnowledgeArticle;
  /** Larger reading size, toggled from the header's "Aa" button. */
  largeText: boolean;
  onAskAi: () => void;
};

/** M7 Knowledge article (procedure / bulletin) with "Ask AI about this". */
export function ArticleView({ article, largeText, onAskAi }: ArticleViewProps) {
  return (
    <DetailScreen
      footer={
        <BrandButton
          label="Ask AI about this"
          icon={<Sparkles size={18} color={colors.onAccent} strokeWidth={2} />}
          onPress={onAskAi}
        />
      }
    >
      <Text style={[styles.title, largeText && styles.titleLarge]} accessibilityRole="header">
        {article.title}
      </Text>
      <View style={styles.chips}>
        <Pill label={article.model} tone="muted" />
        <Pill label={article.revision} tone="muted" />
        {article.offline && <Pill label="Saved offline" tone="brand" icon={Check} />}
      </View>
      {article.blocks.map((block, i) => (
        <Block key={i} block={block} largeText={largeText} />
      ))}
    </DetailScreen>
  );
}

function Block({ block, largeText }: { block: ArticleBlock; largeText: boolean }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <Text color="inkMuted" style={largeText ? styles.bodyLarge : styles.body}>
          {block.text}
        </Text>
      );
    case 'heading':
      return (
        <Text style={styles.heading} accessibilityRole="header">
          {block.text}
        </Text>
      );
    case 'figure':
      return (
        <View style={styles.figure} accessible accessibilityLabel={block.caption}>
          <ImageIcon size={24} color={colors.inkSubtle} strokeWidth={1.75} />
          <Text variant="caption" color="inkSubtle">
            {block.caption}
          </Text>
        </View>
      );
    case 'warning':
      return (
        <View style={styles.warning} accessible accessibilityRole="alert">
          <TriangleAlert size={18} color={colors.amber} strokeWidth={2} />
          <Text style={[styles.warningText, largeText && styles.bodyLarge]}>{block.text}</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.medium, fontSize: 22, lineHeight: 28 },
  titleLarge: { fontSize: 26, lineHeight: 32 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  body: { lineHeight: 24 },
  bodyLarge: { fontSize: 19, lineHeight: 29 },
  heading: { fontFamily: fontFamily.medium, fontSize: 17, lineHeight: 22, marginTop: spacing.xs },
  figure: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.control,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  warning: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.amberBorder,
    backgroundColor: colors.amberTint,
  },
  warningText: { flex: 1, color: colors.amber, lineHeight: 22 },
});
