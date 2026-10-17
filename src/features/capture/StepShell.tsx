import { ChevronLeft, X } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { styles } from './styles';

export const STEP_NAMES = ['Details', 'Photos', 'Notes & hours'] as const;

export type StepShellProps = {
  /** 1-based. */
  step: number;
  /** Back to the previous step; the first step shows a close button instead. */
  onBack?: () => void;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
};

/** Light shell for the form steps of the capture flow: header, progress, scroll, footer. */
export function StepShell({ step, onBack, onClose, footer, children }: StepShellProps) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <MeshBackground spots={APP_MESH} />
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerBar}>
          <Pressable
            onPress={onBack ?? onClose}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={onBack ? 'Back' : 'Close'}
          >
            {onBack ? (
              <ChevronLeft size={24} color={colors.ink} strokeWidth={2} />
            ) : (
              <X size={22} color={colors.ink} strokeWidth={2} />
            )}
          </Pressable>
          <Text style={styles.headerTitle} accessibilityRole="header">
            Log entry
          </Text>
          <Text variant="caption" color="inkMuted" style={styles.step}>
            Step {step} of {STEP_NAMES.length} · {STEP_NAMES[step - 1]}
          </Text>
        </View>
        <View style={styles.progress} accessibilityElementsHidden importantForAccessibility="no">
          {STEP_NAMES.map((name, i) => (
            <View key={name} style={[styles.progressBar, i < step && styles.progressOn]} />
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View>
    </KeyboardAvoidingView>
  );
}
