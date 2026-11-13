import { ChevronRight, ImageOff } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { fontFamily, makeStyles, useTheme } from '@/theme';
import type { Article, ArticleFigure, ArticleSection } from './readerApi';
import { typeMeta } from './meta';

export const paragraphs = (content: string) =>
  content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

/** Type, machine, revision, pages and source chips under the title. */
export function MetaChips({ article: a }: { article: Article }) {
  const styles = useStyles();
  const chips = [
    typeMeta(a.type).label,
    [a.machineMake, a.machineModel].filter(Boolean).join(' '),
    a.revision !== null && a.revision !== '' ? `Rev ${a.revision}` : '',
    a.pageCount ? `${a.pageCount} pages` : '',
  ].filter(Boolean);
  return (
    <View style={styles.chips}>
      {chips.map((c) => (
        <View key={c} style={styles.chip}>
          <Text variant="caption" style={styles.medium}>
            {c}
          </Text>
        </View>
      ))}
      {a.source === 'quiptech_library' && (
        <View style={[styles.chip, styles.library]}>
          <Text variant="caption" color="primaryStrong" style={styles.medium}>
            QuipTech library
          </Text>
        </View>
      )}
    </View>
  );
}

function Figure({ figure, onZoom }: { figure: ArticleFigure; onZoom: (f: ArticleFigure) => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {figure.imageUrl ? (
        <Pressable
          onPress={() => onZoom(figure)}
          accessibilityRole="imagebutton"
          accessibilityLabel={`${figure.caption || 'Figure'}. Opens full screen.`}
        >
          <Image source={{ uri: figure.imageUrl }} style={styles.figure} resizeMode="contain" />
        </Pressable>
      ) : (
        <View style={[styles.figure, styles.placeholder]}>
          <ImageOff size={24} color={colors.muted} strokeWidth={1.8} />
        </View>
      )}
      {!!figure.caption && (
        <Text variant="caption" color="muted">
          {figure.page !== null ? `p. ${figure.page} · ` : ''}
          {figure.caption}
        </Text>
      )}
    </View>
  );
}

/** One section: heading, page badge, paragraphs and figures. `flash` highlights it briefly. */
export function SectionView({
  section,
  flash,
  onLayoutY,
  onZoom,
}: {
  section: ArticleSection;
  flash: boolean;
  onLayoutY: (id: string, y: number) => void;
  onZoom: (f: ArticleFigure) => void;
}) {
  const styles = useStyles();
  return (
    <View
      style={[styles.section, flash && styles.flash]}
      onLayout={(e) => onLayoutY(section.id, e.nativeEvent.layout.y)}
    >
      {(!!section.heading || section.page !== null) && (
        <View style={styles.sectionHead}>
          {!!section.heading && (
            <Text style={styles.heading} accessibilityRole="header">
              {section.heading}
            </Text>
          )}
          {section.page !== null && (
            <View style={styles.pageBadge}>
              <Text variant="caption" color="muted">
                p. {section.page}
              </Text>
            </View>
          )}
        </View>
      )}
      {paragraphs(section.content).map((p, i) => (
        <Text key={i} style={styles.paragraph} selectable>
          {p}
        </Text>
      ))}
      {section.figures.map((f, i) => (
        <Figure key={i} figure={f} onZoom={onZoom} />
      ))}
    </View>
  );
}

/** "Related documents" or "Applies to bulletins": each opens another reader. */
export function LinkCard({
  title,
  links,
  onOpen,
}: {
  title: string;
  links: { id: string; title: string; type?: string }[];
  onOpen: (id: string) => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  if (links.length === 0) return null;
  return (
    <View style={styles.card}>
      <Text variant="label" color="muted">
        {title}
      </Text>
      {links.map((l) => (
        <Pressable
          key={l.id}
          onPress={() => onOpen(l.id)}
          style={({ pressed }) => [styles.link, pressed && { opacity: 0.6 }]}
          accessibilityRole="link"
        >
          <View style={{ flex: 1 }}>
            <Text numberOfLines={2}>{l.title}</Text>
            {l.type && (
              <Text variant="caption" color="muted">
                {typeMeta(l.type).label}
              </Text>
            )}
          </View>
          <ChevronRight size={18} color={colors.muted} strokeWidth={2} />
        </Pressable>
      ))}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: c.fill },
  library: { backgroundColor: c.primaryTint },
  medium: { fontFamily: fontFamily.medium },
  section: { gap: 10, padding: 12, marginHorizontal: -12, borderRadius: 12 },
  flash: { backgroundColor: c.highlightBox },
  sectionHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  heading: { flex: 1, fontFamily: fontFamily.semibold, fontSize: 18, lineHeight: 24 },
  pageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: c.fill,
  },
  paragraph: { fontSize: 16, lineHeight: 24 },
  figure: { width: '100%', height: 220, borderRadius: 12, backgroundColor: c.fill },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  card: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    padding: 14,
    gap: 4,
  },
  link: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8 },
}));
