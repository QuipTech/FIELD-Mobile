import { CircleAlert, CircleCheck, Info } from 'lucide-react-native';
import { Pressable } from 'react-native';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  durations,
  easing,
  fadeIn,
  fadeOut,
  layout,
  makeStyles,
  radii,
  spacing,
  useReducedMotion,
  useTheme,
} from '@/theme';
import { Text } from '../Text/Text';
import { useToastStore, type ToastTone } from './store';

const ICON = { neutral: Info, success: CircleCheck, error: CircleAlert } satisfies Record<
  ToastTone,
  unknown
>;

/**
 * Render once at the app root. Drops in from the top over 200 ms, holds 2.5 s, lifts out.
 * Tap to dismiss early. Fades instead of sliding with Reduce Motion.
 */
export function ToastHost() {
  const current = useToastStore((s) => s.current);
  const dismiss = useToastStore((s) => s.dismiss);
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const styles = useStyles();
  const { colors } = useTheme();
  if (!current) return null;

  const Icon = ICON[current.tone];
  const iconColor =
    current.tone === 'error'
      ? colors.dangerTint
      : current.tone === 'success'
        ? colors.successTint
        : colors.bg;
  const slide = (anim: typeof SlideInUp | typeof SlideOutUp) =>
    anim.duration(durations.small).easing(easing.standard);

  return (
    <Animated.View
      key={current.id}
      entering={reduced ? fadeIn(true) : slide(SlideInUp)}
      exiting={reduced ? fadeOut(true) : slide(SlideOutUp)}
      style={[styles.wrapper, { top: insets.top + spacing.tight }]}
    >
      <Pressable
        onPress={dismiss}
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        accessibilityHint="Tap to dismiss"
        style={styles.toast}
      >
        <Icon size={layout.iconSize} color={iconColor} strokeWidth={1.8} />
        <Text variant="row" color="bg" style={styles.message} numberOfLines={3}>
          {current.message}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const useStyles = makeStyles((c) => ({
  wrapper: { position: 'absolute', left: spacing.lg, right: spacing.lg, zIndex: 20 },
  toast: {
    minHeight: layout.minTapTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.control,
    backgroundColor: c.ink,
  },
  message: { flex: 1 },
}));
