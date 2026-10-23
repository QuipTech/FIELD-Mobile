import { ChevronLeft, ChevronRight, Info, Minus, Plus } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '@/components/Button/IconButton';
import { Text } from '@/components/Text/Text';
import { borders, layout, makeStyles, spacing } from '@/theme';

const ZOOMS = [0.8, 1, 1.2, 1.4, 1.6];

export type ViewerToolbarProps = {
  zoom: number;
  onZoom: (zoom: number) => void;
  pageNumber: number;
  pageCount: number;
  onPage: (n: number) => void;
  onInfo: () => void;
};

/** K5 bottom bar: zoom out / % / in, previous / page of total / next, and document info. */
export function ViewerToolbar({
  zoom,
  onZoom,
  pageNumber,
  pageCount,
  onPage,
  onInfo,
}: ViewerToolbarProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const z = ZOOMS.indexOf(zoom);
  return (
    <View style={[styles.toolbar, { paddingBottom: insets.bottom }]}>
      <View style={styles.group}>
        <IconButton
          icon={Minus}
          accessibilityLabel="Zoom out"
          disabled={z <= 0}
          onPress={() => onZoom(ZOOMS[z - 1] ?? zoom)}
        />
        <Text
          variant="caption"
          style={styles.zoom}
          accessibilityLabel={`Zoom ${Math.round(zoom * 100)} percent`}
        >
          {Math.round(zoom * 100)}%
        </Text>
        <IconButton
          icon={Plus}
          accessibilityLabel="Zoom in"
          disabled={z >= ZOOMS.length - 1}
          onPress={() => onZoom(ZOOMS[z + 1] ?? zoom)}
        />
      </View>
      <View style={styles.group}>
        <IconButton
          icon={ChevronLeft}
          accessibilityLabel="Previous page"
          disabled={pageNumber <= 1}
          onPress={() => onPage(pageNumber - 1)}
        />
        <Text variant="row" accessibilityLabel={`Page ${pageNumber} of ${pageCount}`}>
          {pageNumber} / {pageCount}
        </Text>
        <IconButton
          icon={ChevronRight}
          accessibilityLabel="Next page"
          disabled={pageNumber >= pageCount}
          onPress={() => onPage(pageNumber + 1)}
        />
      </View>
      <IconButton icon={Info} accessibilityLabel="Document info" onPress={onInfo} />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  toolbar: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
    backgroundColor: c.card,
    borderTopWidth: borders.hairline,
    borderTopColor: c.border,
  },
  group: { flexDirection: 'row', alignItems: 'center' },
  zoom: { width: 44, textAlign: 'center', color: c.ink, minHeight: layout.iconSize },
}));
