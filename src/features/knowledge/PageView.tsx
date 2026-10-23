import { Image as ImageIcon } from 'lucide-react-native';
import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Text } from '@/components/Text/Text';
import { fontFamily, spacing, useReducedMotion, useTheme } from '@/theme';
import type { DocPage, PageBlock } from './types';

/** Printed pages stay paper-coloured in dark mode (`--page`), with dark ink. */
const PAPER = { light: '#FFFFFF', dark: '#E9E9EC' } as const;
const PAPER_INK = '#1E2024';
const PAPER_MUTED = '#71767F';
/** Cited-section box on paper (`--hlbox` / #E0B400 outline in the design). */
const CITED = { fill: '#FFF6D1', outline: '#E0B400' } as const;

export type PageViewProps = {
  page: DocPage | null | undefined;
  pageNumber: number;
  /** Section the AI cited: outlined and pulsed twice. */
  sectionId?: string;
  /** Text scale from the zoom buttons (1 = 100%). */
  zoom: number;
  /** Reports the cited section's y offset so the viewer can scroll to it. */
  onSectionLayout?: (y: number) => void;
};

/** One printed page. TODO(api): draw the server's page image under the text when it arrives. */
export function PageView({ page, pageNumber, sectionId, zoom, onSectionLayout }: PageViewProps) {
  const { scheme } = useTheme();
  const size = (n: number) => Math.round(n * zoom);
  return (
    <View
      style={[styles.paper, { backgroundColor: PAPER[scheme] }]}
      accessibilityLabel={`Page ${pageNumber}`}
    >
      <View style={styles.running}>
        <Text style={[styles.runningText, { fontSize: size(10) }]}>{page?.header ?? ''}</Text>
        <Text style={[styles.runningText, { fontSize: size(10) }]}>{pageNumber}</Text>
      </View>
      {page ? (
        page.sections.map((s) => {
          const blocks = s.blocks.map((b, i) => <Block key={i} block={b} size={size} />);
          return s.id === sectionId ? (
            <Cited key={s.id} onLayout={(e) => onSectionLayout?.(e.nativeEvent.layout.y)}>
              {blocks}
            </Cited>
          ) : (
            <View key={s.id} style={styles.section}>
              {blocks}
            </View>
          );
        })
      ) : (
        <View style={styles.section}>
          {[100, 92, 70, 96, 88, 60].map((w, i) => (
            <View key={i} style={[styles.line, { width: `${w}%` }]} />
          ))}
          <Text style={[styles.runningText, { fontSize: size(11) }]}>
            Page text isn’t available for this page yet.
          </Text>
        </View>
      )}
    </View>
  );
}

function Cited({
  children,
  onLayout,
}: {
  children: ReactNode;
  onLayout: (e: LayoutChangeEvent) => void;
}) {
  const reduced = useReducedMotion();
  const ring = useSharedValue(0);
  useEffect(() => {
    if (reduced) return;
    const pulse = withSequence(withTiming(1, { duration: 400 }), withTiming(0, { duration: 600 }));
    ring.set(withRepeat(pulse, 2));
  }, [reduced, ring]);
  const animated = useAnimatedStyle(() => ({
    shadowOpacity: 0.55 * ring.get(),
    shadowRadius: 12 * ring.get(),
  }));
  return (
    <Animated.View
      style={[styles.cited, animated]}
      onLayout={onLayout}
      accessibilityLabel="Cited section"
      accessible={false}
    >
      {children}
    </Animated.View>
  );
}

function Block({ block, size }: { block: PageBlock; size: (n: number) => number }) {
  switch (block.type) {
    case 'heading':
      return (
        <Text
          style={[styles.heading, { fontSize: size(15), lineHeight: size(20) }]}
          accessibilityRole="header"
        >
          {block.text}
        </Text>
      );
    case 'paragraph':
      return (
        <Text style={[styles.body, { fontSize: size(13), lineHeight: size(19) }]}>
          {block.text}
        </Text>
      );
    case 'specs':
      return (
        <View style={styles.specs}>
          {block.rows.map((r) => (
            <View
              key={r.label}
              style={styles.specRow}
              accessible
              accessibilityLabel={`${r.label}: ${r.value}`}
            >
              <Text style={[styles.body, { fontSize: size(13) }]}>{r.label}</Text>
              <Text style={[styles.body, styles.value, { fontSize: size(13) }]}>{r.value}</Text>
            </View>
          ))}
        </View>
      );
    case 'figure':
      return (
        <View style={styles.figure} accessible accessibilityLabel={block.caption}>
          <ImageIcon size={20} color={PAPER_MUTED} strokeWidth={1.6} />
          <Text style={[styles.runningText, { fontSize: size(11) }]}>{block.caption}</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  paper: {
    borderRadius: 4,
    padding: 20,
    gap: spacing.tight,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  running: { flexDirection: 'row', justifyContent: 'space-between' },
  runningText: { fontFamily: fontFamily.medium, color: PAPER_MUTED },
  section: { gap: spacing.xs },
  heading: { fontFamily: fontFamily.semibold, color: PAPER_INK },
  body: { fontFamily: fontFamily.regular, color: PAPER_INK },
  value: { fontFamily: fontFamily.semibold },
  specs: {
    gap: 4,
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.15)',
  },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  cited: {
    backgroundColor: CITED.fill,
    borderWidth: 2,
    borderColor: CITED.outline,
    borderRadius: 6,
    padding: spacing.sm,
    marginHorizontal: -6,
    gap: spacing.xs,
    shadowColor: CITED.outline,
    shadowOffset: { width: 0, height: 0 },
  },
  line: { height: 7, borderRadius: 3, backgroundColor: '#D9DADF' },
  figure: {
    height: 96,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#C4C7CE',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
