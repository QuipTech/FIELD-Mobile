import { CircleCheck, Download } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { brandControl, colors, fontFamily, spacing } from '@/theme';

export type HeaderActionsProps = {
  largeText: boolean;
  onToggleText: () => void;
  offline: boolean;
  onDownload: () => void;
};

/** M7 header buttons: reading size ("Aa") and save for offline. */
export function HeaderActions({
  largeText,
  onToggleText,
  offline,
  onDownload,
}: HeaderActionsProps) {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggleText}
        hitSlop={4}
        style={[styles.button, largeText && styles.buttonOn]}
        accessibilityRole="button"
        accessibilityLabel={largeText ? 'Smaller text' : 'Larger text'}
        accessibilityState={{ selected: largeText }}
      >
        <Text color={largeText ? 'brand' : 'ink'} style={styles.aa}>
          Aa
        </Text>
      </Pressable>
      <Pressable
        onPress={onDownload}
        hitSlop={4}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel={offline ? 'Saved for offline use' : 'Save for offline use'}
      >
        {offline ? (
          <CircleCheck size={16} color={colors.brand} strokeWidth={2} />
        ) : (
          <Download size={16} color={colors.ink} strokeWidth={2} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  button: {
    minWidth: 34,
    height: 32,
    paddingHorizontal: spacing.xs,
    borderRadius: brandControl.radius,
    borderWidth: 1,
    borderColor: colors.control,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOn: { borderColor: colors.brandTintStrong, backgroundColor: colors.brandTint },
  aa: { fontFamily: fontFamily.medium, fontSize: 13 },
});
