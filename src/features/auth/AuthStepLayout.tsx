import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { Decorations } from './Decorations';
import { styles } from './recoveryStyles';

export type AuthStepLayoutProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  /** Form controls: right under the heading when there's a footer, else pinned to the bottom. */
  children: ReactNode;
  /**
   * The main action, pinned to the bottom of the screen; it rides up above the keyboard while
   * the fields above stay in view under the heading.
   */
  footer?: ReactNode;
};

// iOS announces the keyboard before it moves; Android only once it has.
const SHOW = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
const HIDE = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener(SHOW, () => setOpen(true));
    const hide = Keyboard.addListener(HIDE, () => setOpen(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  return open;
}

/** M1c–M1e shell: icon tile, title and subtitle up top; then the form, and its footer. */
export function AuthStepLayout({
  icon: Icon,
  title,
  subtitle,
  children,
  footer,
}: AuthStepLayoutProps) {
  const insets = useSafeAreaInsets();
  const keyboardOpen = useKeyboardOpen();
  return (
    // 'padding' on Android too: the app draws edge to edge, so the window doesn't shrink for the
    // keyboard (adjustResize has no effect) and this view has to make room itself.
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <Decorations placement="step" />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top, paddingBottom: footer ? 0 : insets.bottom },
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
        {!footer && <View style={styles.spacer} />}
        <View style={[styles.form, !!footer && styles.formTop]}>{children}</View>
      </ScrollView>
      {footer && (
        // Above the home indicator, or just above the keyboard while it's open.
        <View style={[styles.footer, { paddingBottom: (keyboardOpen ? 0 : insets.bottom) + 16 }]}>
          {footer}
        </View>
      )}
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
