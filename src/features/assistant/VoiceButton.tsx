import { ArrowUp, Mic, Square } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors, useReducedMotion } from '@/theme';
import { styles } from './styles';

export type VoiceButtonProps = {
  /** What a press does now: send the text, start voice typing, or stop it. */
  mode: 'send' | 'voice' | 'stop';
  onPress: () => void;
};

const LABEL = { send: 'Send', voice: 'Ask by voice', stop: 'Stop voice typing' } as const;
const ICON = { send: ArrowUp, voice: Mic, stop: Square } as const;

/** The composer's trailing button; while listening it turns red and a halo pulses around it. */
export function VoiceButton({ mode, onPress }: VoiceButtonProps) {
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0);
  const listening = mode === 'stop';

  useEffect(() => {
    if (!listening || reduced) {
      cancelAnimation(pulse);
      pulse.set(0);
      return;
    }
    pulse.set(withRepeat(withTiming(1, { duration: 1200, easing: Easing.out(Easing.quad) }), -1));
  }, [listening, reduced, pulse]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: 0.35 * (1 - pulse.value),
    transform: [{ scale: 1 + 0.5 * pulse.value }],
  }));
  const Icon = ICON[mode];

  return (
    <View>
      {listening && <Animated.View style={[styles.voiceHalo, haloStyle]} pointerEvents="none" />}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.send,
          listening && styles.sendListening,
          pressed && styles.sendPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={LABEL[mode]}
      >
        <Icon
          size={listening ? 16 : 20}
          color={colors.onAccent}
          fill={listening ? colors.onAccent : 'none'}
          strokeWidth={mode === 'send' ? 2.5 : 2}
        />
      </Pressable>
    </View>
  );
}
