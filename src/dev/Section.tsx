import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Divider, Text } from '@/components';
import { spacing } from '@/theme';

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="overline" color="inkMuted" accessibilityRole="header">
        {title}
      </Text>
      <Divider />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ section: { gap: spacing.sm, marginBottom: spacing.lg } });
