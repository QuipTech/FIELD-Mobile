import type { ReactNode } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { haptics } from '@/lib/haptics';
import { durations, easing, scales, useReducedMotion } from '@/theme';

type State = { pressed: boolean };

export type PressableScaleProps = Omit<PressableProps, 'style' | 'children'> & {
  children: ReactNode | ((state: State) => ReactNode);
  /** Visual style of the surface that scales (background, border, padding). */
  style?: StyleProp<ViewStyle> | ((state: State) => StyleProp<ViewStyle>);
  /** Layout of the outer touch area within its parent (flex, alignSelf, margins). */
  containerStyle?: StyleProp<ViewStyle>;
  /** Light haptic on press (primary actions only). */
  haptic?: boolean;
};

/** Press feedback for every tappable surface: scale to 0.97 in 90 ms (none with Reduce Motion). */
export function PressableScale(props: PressableScaleProps) {
  const { children, style, containerStyle, haptic, onPressIn, onPressOut, ...rest } = props;
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  function scaleTo(value: number) {
    if (reduced) return;
    scale.set(
      withTiming(value, {
        duration: durations.press,
        easing: easing.standard,
      }),
    );
  }

  return (
    <Pressable
      {...rest}
      style={containerStyle}
      onPressIn={(e) => {
        scaleTo(scales.press);
        if (haptic) haptics.light();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scaleTo(1);
        onPressOut?.(e);
      }}
    >
      {(state) => (
        <Animated.View style={[typeof style === 'function' ? style(state) : style, animated]}>
          {typeof children === 'function' ? children(state) : children}
        </Animated.View>
      )}
    </Pressable>
  );
}
