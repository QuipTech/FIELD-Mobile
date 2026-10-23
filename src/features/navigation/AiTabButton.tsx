import { Sparkles } from 'lucide-react-native';
import { Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { Text } from '@/components/Text/Text';
import { useTheme } from '@/theme';
import { AI_SIZE, useStyles } from './styles';
import { useOrbMotion } from './useOrbMotion';

const RING = AI_SIZE + 12;
const RING_R = RING / 2 - 2;
const ARC = 2 * Math.PI * RING_R;

type Props = { label: string; focused: boolean; onPress: () => void };

/** The centre AI tab: a raised gradient orb with a glow ring and halo (see useOrbMotion). */
export function AiTabButton({ label, focused, onPress }: Props) {
  const styles = useStyles();
  const { colors } = useTheme();
  const motion = useOrbMotion();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={motion.pressIn}
      onPressOut={motion.pressOut}
      style={styles.aiSlot}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View style={[styles.aiFloat, motion.floatStyle]}>
        <Animated.View style={[styles.aiHalo, motion.haloStyle]} />
        <Animated.View style={[styles.aiRing, motion.ringStyle]}>
          <GlowRing focused={focused} />
        </Animated.View>
        <Animated.View style={styles.aiButton}>
          <OrbFill />
          <Animated.View style={motion.iconStyle}>
            <Sparkles size={26} color={colors.onButton} strokeWidth={2.2} />
          </Animated.View>
        </Animated.View>
      </Animated.View>
      <Text style={[styles.label, focused && styles.labelOn]} numberOfLines={1}>
        Ask AI
      </Text>
    </Pressable>
  );
}

/** A partial arc fading from violet to clear; it spins around the orb. */
function GlowRing({ focused }: { focused: boolean }) {
  const { colors } = useTheme();
  return (
    <Svg width={RING} height={RING}>
      <Defs>
        <LinearGradient id="aiRing" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.scanLine} />
          <Stop offset="1" stopColor={colors.success} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Circle
        cx={RING / 2}
        cy={RING / 2}
        r={RING_R}
        stroke="url(#aiRing)"
        strokeWidth={focused ? 3 : 2}
        strokeLinecap="round"
        strokeDasharray={`${ARC * 0.62} ${ARC}`}
        fill="none"
      />
    </Svg>
  );
}

/** Brand gradient, light violet top-left to night bottom-right, like the splash. */
function OrbFill() {
  const { colors } = useTheme();
  return (
    <Svg style={StyleSheet.absoluteFill}>
      <Defs>
        <LinearGradient id="aiFill" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.scanLine} />
          <Stop offset="0.5" stopColor={colors.primary} />
          <Stop offset="1" stopColor={colors.brandNight} />
        </LinearGradient>
      </Defs>
      <Circle cx="50%" cy="50%" r="50%" fill="url(#aiFill)" />
    </Svg>
  );
}
