import { X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '../Button/IconButton';
import { Divider } from '../Divider/Divider';
import { Text } from '../Text/Text';
import { styles } from './styles';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** Prevent dismiss by tapping the scrim (e.g. unsaved form). */
  dismissable?: boolean;
};

/** Bottom sheet — the only elevated surface in the system. */
export function Sheet({ visible, onClose, title, children, dismissable = true }: SheetProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable
          style={styles.scrim}
          onPress={dismissable ? onClose : undefined}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View style={[styles.panel, { paddingBottom: insets.bottom }]} accessibilityViewIsModal>
          <View style={styles.header}>
            <Text variant="heading" style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <IconButton icon={X} accessibilityLabel="Close" onPress={onClose} />
          </View>
          <Divider />
          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
