import { Image as ImageIcon } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { brandControl, colors, fontFamily, spacing } from '@/theme';
import { Pill, type PillProps } from '../Pill/Pill';
import { Text } from '../Text/Text';

export type TimelineRowProps = {
  /** Entry type chip, e.g. "Repair" with a wrench. */
  pill: PillProps;
  /** Right-aligned, e.g. "12 Mar · J. Okoye". */
  meta: string;
  title: string;
  detail?: string;
  /** Number of photo thumbnails to show (placeholders unless `photoUris` is given). */
  photos?: number;
  photoUris?: string[];
  /** Hairline above the row (every row but the first). */
  divider?: boolean;
  onPress?: () => void;
  onOpenPhoto?: (index: number) => void;
};

/** One dated entry in a history / configuration timeline (M5, M5.5, M16). */
export function TimelineRow({
  pill,
  meta,
  title,
  detail,
  photos = 0,
  photoUris,
  divider,
  ...props
}: TimelineRowProps) {
  const label = `${pill.label}, ${meta}: ${title}${detail ? `. ${detail}` : ''}`;
  const body = (
    <>
      <View style={styles.head}>
        <Pill {...pill} />
        <Text variant="caption" color="inkSubtle" numberOfLines={1} style={styles.meta}>
          {meta}
        </Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {detail && (
        <Text variant="caption" color="inkMuted">
          {detail}
        </Text>
      )}
    </>
  );

  return (
    <View style={[styles.row, divider && styles.divider]}>
      {props.onPress ? (
        <Pressable
          onPress={props.onPress}
          style={({ pressed }) => [styles.body, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          {body}
        </Pressable>
      ) : (
        <View style={styles.body} accessible accessibilityLabel={label}>
          {body}
        </View>
      )}
      {photos > 0 && (
        <View style={styles.photos}>
          {Array.from({ length: photos }, (_, i) => (
            <Pressable
              key={i}
              onPress={() => props.onOpenPhoto?.(i)}
              disabled={!props.onOpenPhoto}
              style={({ pressed }) => [styles.photo, pressed && styles.pressed]}
              accessibilityRole="imagebutton"
              accessibilityLabel={`Photo ${i + 1} of ${photos}`}
            >
              {photoUris?.[i] ? (
                <Image source={{ uri: photoUris[i] }} style={styles.photoImage} />
              ) : (
                <ImageIcon size={18} color={colors.inkMuted} strokeWidth={2} />
              )}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 14, gap: spacing.sm },
  divider: { borderTopWidth: 1, borderTopColor: colors.divider },
  body: { gap: 6 },
  pressed: { opacity: 0.6 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  meta: { flexShrink: 1 },
  title: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 21 },
  photos: { flexDirection: 'row', gap: spacing.xs },
  photo: {
    width: 68,
    height: 52,
    borderRadius: brandControl.radius,
    borderWidth: 1,
    borderColor: colors.control,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoImage: { width: '100%', height: '100%' },
});
