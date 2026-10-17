import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { colors, fontFamily, spacing } from '@/theme';
import { BrandButton } from '../BrandButton/BrandButton';
import { Text } from '../Text/Text';

export type EmptyPanelProps = {
  icon: LucideIcon;
  title: string;
  message?: string;
  action?: { label: string; onPress: () => void };
};

/** Centred empty / not-found state for the M2+ screens (the flat `EmptyState` is the older style). */
export function EmptyPanel({ icon: Icon, title, message, action }: EmptyPanelProps) {
  return (
    <View style={styles.root}>
      <View style={styles.icon} accessibilityElementsHidden importantForAccessibility="no">
        <Icon size={22} color={colors.brand} strokeWidth={2} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      {message && (
        <Text variant="caption" color="inkMuted" style={styles.message}>
          {message}
        </Text>
      )}
      {action && (
        <BrandButton
          variant="outline"
          label={action.label}
          onPress={action.onPress}
          style={styles.action}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 22, textAlign: 'center' },
  message: { textAlign: 'center', maxWidth: 280 },
  action: { marginTop: spacing.sm, minHeight: 44, paddingHorizontal: spacing.lg },
});
