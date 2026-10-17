import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, spacing } from '@/theme';
import { APP_MESH, MeshBackground } from '../MeshBackground/MeshBackground';

export type DetailScreenProps = {
  children: ReactNode;
  /** Pinned under the scrolling content, above the home indicator (e.g. the main action). */
  footer?: ReactNode;
  /**
   * Header height when the footer holds a text input: the footer then rides above the keyboard.
   * Routes pass `useHeaderHeight()`; leave unset otherwise.
   */
  keyboardOffset?: number;
};

/** Canvas + mesh shell for screens pushed over the tabs (white native header on top). */
export function DetailScreen({ children, footer, keyboardOffset }: DetailScreenProps) {
  const insets = useSafeAreaInsets();
  const body = (
    <>
      <ScrollView
        contentContainerStyle={[styles.content, !footer && { paddingBottom: insets.bottom + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.sm }]}>{footer}</View>
      )}
    </>
  );

  return (
    <View style={styles.root}>
      <MeshBackground spots={APP_MESH} />
      {keyboardOffset === undefined ? (
        body
      ) : (
        <KeyboardAvoidingView
          style={styles.root}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={keyboardOffset}
        >
          {body}
        </KeyboardAvoidingView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.md, gap: 14 },
  footer: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, gap: spacing.sm },
});
