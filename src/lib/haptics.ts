import * as Haptics from 'expo-haptics';

/**
 * Haptics per the design: light on primary actions, success on scan match and save, warning
 * on validation errors, none on scroll. Failures (no engine, simulator) are ignored.
 */
export const haptics = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined),
  success: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined),
  warning: () =>
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined),
};
