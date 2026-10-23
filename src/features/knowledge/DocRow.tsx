import { Download } from 'lucide-react-native';
import { Platform, View } from 'react-native';

import { Badge } from '@/components/Badge/Badge';
import { PressableScale } from '@/components/PressableScale/PressableScale';
import { Text } from '@/components/Text/Text';
import { formatDate } from '@/lib/date';
import { borders, makeStyles, radii, spacing, useTheme } from '@/theme';
import { highlightParts } from './search';
import { DOC_TYPE, type KnowledgeDoc } from './types';

export type DocRowProps = {
  doc: KnowledgeDoc;
  onPress: () => void;
  /** Search results: "Caterpillar › Machine maintenance · p.142" and a highlighted snippet. */
  hit?: { snippet: string; page?: number; query: string };
  /** Show the saved-offline icon (K7c). */
  offline?: boolean;
  last?: boolean;
};

/** `.doc` row: title, type badge, model tags and version line. Admins also see review state. */
export function DocRow({ doc, onPress, hit, offline, last }: DocRowProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const type = DOC_TYPE[doc.type];
  const review = doc.status === 'review';
  const failed = doc.status === 'failed';
  const where = `${doc.brandName} › ${doc.categoryName}${hit?.page ? ` · p.${hit.page}` : ''}`;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[doc.title, type.label, doc.models.join(', '), review && 'Needs review']
        .filter(Boolean)
        .join('. ')}
      style={({ pressed }) => [
        styles.row,
        last && styles.last,
        review && styles.review,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.titleLine}>
        <Text variant="bodyStrong" style={styles.title}>
          {doc.title}
        </Text>
        {hit && <Badge label={type.label} tone={type.tone} />}
        {review && <Badge label="Needs review" tone="warning" />}
        {failed && <Badge label="Index failed" tone="danger" />}
      </View>
      {hit ? (
        <>
          <Text variant="caption" color="muted">
            {where}
          </Text>
          <Snippet text={hit.snippet} query={hit.query} />
        </>
      ) : (
        <View style={styles.meta}>
          <Badge label={type.label} tone={type.tone} />
          {doc.models.map((m) => (
            <View key={m} style={styles.model}>
              <Text variant="caption" color="muted" style={styles.mono}>
                {m}
              </Text>
            </View>
          ))}
          <Text variant="caption" color="muted">
            v{doc.version} · {review ? 'Uploaded' : 'Updated'} {formatDate(doc.updatedAt)}
          </Text>
          {offline && <Download size={15} color={colors.primary} strokeWidth={1.8} />}
        </View>
      )}
    </PressableScale>
  );
}

/** Snippet with matching words highlighted (`<mark>`). */
export function Snippet({ text, query }: { text: string; query: string }) {
  const styles = useStyles();
  return (
    <Text variant="label" color="muted">
      {highlightParts(text, query).map((part, i) =>
        part.match ? (
          <Text key={i} variant="label" style={styles.mark}>
            {part.text}
          </Text>
        ) : (
          part.text
        ),
      )}
    </Text>
  );
}

const useStyles = makeStyles((c) => ({
  row: {
    gap: 7,
    padding: spacing.snug,
    borderBottomWidth: borders.hairline,
    borderBottomColor: c.border,
  },
  last: { borderBottomWidth: 0 },
  review: { backgroundColor: c.warningTint },
  pressed: { backgroundColor: c.fill },
  titleLine: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs },
  title: { flex: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs },
  model: {
    borderWidth: borders.hairline,
    borderColor: c.borderStrong,
    borderRadius: radii.badge,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  mono: { fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 12 },
  mark: { backgroundColor: c.highlight, color: c.ink },
}));
