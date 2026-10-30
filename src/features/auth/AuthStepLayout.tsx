import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { Decorations } from './Decorations';
import { styles } from './recoveryStyles';

export type AuthStepLayoutProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Form controls: pinned to the bottom (just above the keyboard) or right under the heading. */
  children: ReactNode;
  /**
   * 'top' keeps the form under the heading, in view while the keyboard is open (the code entry
   * screen: Android draws edge to edge, so a bottom-pinned form can end up under the keyboard).
   */
  formPosition?: 'top' | 'bottom';
};

/** M1c–M1e shell: icon tile, title and subtitle up top; the form at the bottom (or under them). */
export function AuthStepLayout({
  icon: Icon,
  title,
  subtitle,
  children,
  formPosition = 'bottom',
}: AuthStepLayoutProps) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Decorations placement="step" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View style={styles.tile}>
            <Icon size={22} color={colors.brandDeep} strokeWidth={2} />
          </View>
          <View style={styles.headings}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <Text variant="caption" color="inkMuted" style={styles.centered}>
              {subtitle}
            </Text>
          </View>
        </View>
        {formPosition === 'bottom' && <View style={styles.spacer} />}
        <View style={[styles.form, formPosition === 'top' && styles.formTop]}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Centred caption with an inline link, e.g. "Didn't get it? Resend code". */
export function InlineLink({
  prefix,
  label,
  onPress,
  disabled,
}: {
  prefix?: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.linkRow}>
      {prefix && (
        <Text variant="caption" color="inkMuted">
          {prefix}
        </Text>
      )}
      <Text
        variant="caption"
        color={disabled ? 'inkSubtle' : 'brand'}
        onPress={disabled ? undefined : onPress}
        accessibilityRole="link"
        accessibilityState={{ disabled: !!disabled }}
        suppressHighlighting
        style={styles.link}
      >
        {label}
      </Text>
    </View>
  );
}
