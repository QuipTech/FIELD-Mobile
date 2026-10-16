import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { colors } from '@/theme';
import { styles } from './styles';

export type ScreenProps = {
  children: ReactNode;
  /** Wrap in a ScrollView with standard padding. Use false for FlashList screens. */
  scroll?: boolean;
  edges?: Edge[];
  refreshing?: boolean;
  onRefresh?: () => void;
};

/** Standard screen shell: ground background, safe area, optional scroll + pull-to-refresh. */
export function Screen({
  children,
  scroll = true,
  edges = ['left', 'right'],
  ...refresh
}: ScreenProps) {
  return (
    <SafeAreaView style={styles.root} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, styles.grow]}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            refresh.onRefresh ? (
              <RefreshControl
                refreshing={!!refresh.refreshing}
                onRefresh={refresh.onRefresh}
                tintColor={colors.ink}
                colors={[colors.accent]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.root}>{children}</View>
      )}
    </SafeAreaView>
  );
}
