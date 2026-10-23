import { Sparkles, X } from 'lucide-react-native';
import { useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { IconButton } from '@/components/Button/IconButton';
import { Text } from '@/components/Text/Text';
import { makeStyles, spacing, useTheme } from '@/theme';
import { PageView } from './PageView';
import { ViewerToolbar } from './ViewerToolbar';
import type { DocPage, KnowledgeDoc } from './types';

export type DocumentViewerProps = {
  doc: KnowledgeDoc;
  pageNumber: number;
  page: DocPage | null | undefined;
  /** Set when opened from an AI citation (`?section=4.3`). */
  sectionId?: string;
  onPage: (n: number) => void;
  onInfo: () => void;
};

/** K5 Document viewer: the page, a citation banner, and zoom / page / info controls. */
export function DocumentViewer({
  doc,
  pageNumber,
  page,
  sectionId,
  onPage,
  onInfo,
}: DocumentViewerProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const scroll = useRef<ScrollView>(null);
  const [zoom, setZoom] = useState(1);
  const [banner, setBanner] = useState(!!sectionId);

  return (
    <View style={styles.root}>
      {banner && sectionId && (
        <View style={styles.banner} accessibilityRole="alert">
          <Sparkles size={15} color={colors.primaryStrong} strokeWidth={1.8} />
          <Text variant="label" color="primaryStrong" style={styles.bannerText}>
            From AI answer · Section {sectionId} highlighted
          </Text>
          <IconButton icon={X} accessibilityLabel="Dismiss" onPress={() => setBanner(false)} />
        </View>
      )}
      <ScrollView
        ref={scroll}
        style={styles.canvas}
        contentContainerStyle={styles.canvasContent}
        maximumZoomScale={3}
      >
        <PageView
          page={page}
          pageNumber={pageNumber}
          sectionId={sectionId}
          zoom={zoom}
          onSectionLayout={(y) =>
            scroll.current?.scrollTo({ y: Math.max(0, y - 24), animated: true })
          }
        />
      </ScrollView>
      <ViewerToolbar
        zoom={zoom}
        onZoom={setZoom}
        pageNumber={pageNumber}
        pageCount={doc.pageCount}
        onPage={onPage}
        onInfo={onInfo}
      />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingLeft: spacing.snug,
    backgroundColor: c.primaryTint,
  },
  bannerText: { flex: 1 },
  canvas: { flex: 1, backgroundColor: c.fill },
  canvasContent: { padding: spacing.md },
}));
