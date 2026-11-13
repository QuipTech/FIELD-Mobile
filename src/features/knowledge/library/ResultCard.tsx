import { memo } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { formatRelative } from '@/lib/date';
import { fontFamily, makeStyles, useTheme } from '@/theme';
import type { KnowledgeResult } from './api';
import { typeMeta } from './meta';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The snippet split into plain and highlighted parts (case-insensitive). `<mark>` tags from the
 * API also count as highlights.
 */
export function highlightParts(snippet: string, highlights: string[] = []) {
  const marked = [...snippet.matchAll(/<mark>(.*?)<\/mark>/g)].map((m) => m[1]!).filter(Boolean);
  const text = snippet.replace(/<\/?mark>/g, '');
  const words = [...new Set([...highlights, ...marked].map((w) => w.trim()).filter(Boolean))];
  if (words.length === 0) return [{ text, bold: false }];
  const re = new RegExp(
    `(${words
      .sort((a, b) => b.length - a.length)
      .map(escape)
      .join('|')})`,
    'gi',
  );
  return text
    .split(re)
    .filter((part) => part !== '')
    .map((part) => ({
      text: part,
      bold: words.some((w) => w.toLowerCase() === part.toLowerCase()),
    }));
}

export type ResultCardProps = {
  item: KnowledgeResult;
  onOpen: (item: KnowledgeResult) => void;
  onLongPress: (item: KnowledgeResult) => void;
};

/** One library result: type, source, model, title, matched heading and snippet, then meta. */
export const ResultCard = memo(function ResultCard({ item, onOpen, onLongPress }: ResultCardProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const meta = typeMeta(item.type);
  const Icon = meta.icon;
  const model = item.models[0];
  const footer = [
    item.page !== null ? `p. ${item.page}` : null,
    `Rev ${item.versionNumber}`,
    formatRelative(item.updatedAt),
  ].filter(Boolean);

  return (
    <Pressable
      onPress={() => onOpen(item)}
      onLongPress={() => onLongPress(item)}
      delayLongPress={350}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={[meta.label, item.title, model].filter(Boolean).join(', ')}
      accessibilityHint="Opens the document. Long press for more actions."
    >
      <View style={styles.top}>
        <View style={styles.chip}>
          <Icon size={13} color={colors.ink} strokeWidth={2} />
          <Text variant="caption" style={styles.chipText}>
            {meta.label}
          </Text>
        </View>
        {item.source === 'shared' && (
          <View style={[styles.chip, styles.library]}>
            <Text variant="caption" color="primaryStrong" style={styles.chipText}>
              QuipTech library
            </Text>
          </View>
        )}
        {!!model && (
          <Text variant="caption" color="muted" numberOfLines={1} style={styles.model}>
            {model}
          </Text>
        )}
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      {(!!item.heading || !!item.snippet) && (
        <View style={styles.description}>
          {!!item.heading && (
            <Text variant="caption" color="muted" numberOfLines={1} style={styles.heading}>
              {item.heading.toUpperCase()}
            </Text>
          )}
          {!!item.snippet && (
            <Text variant="caption" color="muted" numberOfLines={3}>
              {highlightParts(item.snippet, item.highlights).map((p, i) =>
                p.bold ? (
                  <Text key={i} variant="caption" color="ink" style={styles.bold}>
                    {p.text}
                  </Text>
                ) : (
                  p.text
                ),
              )}
            </Text>
          )}
        </View>
      )}
      <View style={styles.footer}>
        <Text variant="caption" color="faint">
          {footer.join(' · ')}
        </Text>
      </View>
    </Pressable>
  );
});

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: c.border,
    padding: 14,
    gap: 6,
  },
  pressed: { opacity: 0.75 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: c.fill,
  },
  library: { backgroundColor: c.primaryTint },
  chipText: { fontFamily: fontFamily.medium },
  model: { flex: 1, textAlign: 'right' },
  title: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 21 },
  heading: { letterSpacing: 0.5 },
  description: {
    borderTopWidth: 1,
    borderTopColor: c.fill,
    marginTop: 2,
    paddingTop: 8,
    gap: 4,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: c.border,
    backgroundColor: c.bg,
    marginHorizontal: -14,
    marginBottom: -14,
    marginTop: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  bold: { fontFamily: fontFamily.semibold },
}));
