import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fontFamily, spacing } from '@/theme';
import { Text } from '../Text/Text';

export type ModalSheetProps = {
  visible: boolean;
  title: string;
  /** Not called while `busy`, so a running request can't be dismissed. */
  onClose: () => void;
  busy?: boolean;
  children: ReactNode;
  /** Buttons pinned under the content. */
  footer?: ReactNode;
};

/**
 * Bottom panel over a scrim, for confirmations and short forms. A React Native `Modal`, so it
 * shows above pushed stack screens (the gorhom `Sheet` doesn't present there).
 */
export function ModalSheet({ visible, title, onClose, busy, children, footer }: ModalSheetProps) {
  const insets = useSafeAreaInsets();
  const close = () => {
    if (!busy) onClose();
  };
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable
        style={styles.scrim}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="Close"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoid}
        pointerEvents="box-none"
      >
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}
          accessibilityViewIsModal
        >
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {children}
          </ScrollView>
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: colors.guideScrim },
  avoid: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    maxHeight: '88%',
  },
  title: { fontFamily: fontFamily.medium, fontSize: 17, paddingBottom: spacing.sm },
  body: { flexShrink: 1 },
  bodyContent: { gap: 12, paddingBottom: spacing.sm },
  footer: { gap: spacing.xs, paddingTop: spacing.xs },
});
