import { Wifi, WifiOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsOffline } from '@/lib/network';
import {
  durations,
  easing,
  fadeIn,
  fadeOut,
  layout,
  makeStyles,
  spacing,
  useReducedMotion,
  useTheme,
} from '@/theme';
import { Text } from '../Text/Text';

export type OfflineBannerProps = {
  /** Queued writes, shown while offline (wired to the outbox in step 8). */
  pendingCount?: number;
};

/**
 * Global connection banner: slides in over 200 ms when the connection drops, turns green on
 * reconnect, then hides 2 s later. Fades with Reduce Motion.
 */
export function OfflineBanner({ pendingCount = 0 }: OfflineBannerProps) {
  const offline = useIsOffline();
  // "Back online" shows after a reconnect until the auto-hide timer clears it.
  const [prevOffline, setPrevOffline] = useState(offline);
  const [back, setBack] = useState(false);
  if (offline !== prevOffline) {
    setPrevOffline(offline);
    setBack(!offline);
  }
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const styles = useStyles();
  const { colors } = useTheme();

  useEffect(() => {
    if (!back) return;
    const timer = setTimeout(() => setBack(false), durations.offlineAutoHide);
    return () => clearTimeout(timer);
  }, [back]);

  if (!offline && !back) return null;
  const pending = pendingCount > 0 ? ` · ${pendingCount} waiting to sync` : '';
  const message = back ? 'Back online' : `You're offline${pending}`;
  const tone = back ? colors.success : colors.warning;
  const slide = (anim: typeof SlideInUp | typeof SlideOutUp) =>
    anim.duration(durations.small).easing(easing.standard);
  const Icon = back ? Wifi : WifiOff;

  return (
    <Animated.View
      entering={reduced ? fadeIn(true) : slide(SlideInUp)}
      exiting={reduced ? fadeOut(true) : slide(SlideOutUp)}
      style={[styles.banner, back && styles.back, { paddingTop: insets.top + spacing.xs }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
    >
      <Icon size={layout.iconSize} color={tone} strokeWidth={1.8} />
      <Text variant="row" style={[styles.text, { color: tone }]}>
        {message}
      </Text>
    </Animated.View>
  );
}

const useStyles = makeStyles((c) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.snug,
    paddingBottom: spacing.xs,
    backgroundColor: c.warningTint,
  },
  back: { backgroundColor: c.successTint },
  text: { flex: 1 },
}));
