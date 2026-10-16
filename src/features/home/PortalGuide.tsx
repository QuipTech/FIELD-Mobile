import { ChevronRight, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { styles } from './guideStyles';
import { GUIDE_STEPS } from './guideSteps';

export type PortalGuideProps = { visible: boolean; onDone: () => void };

/** M2b first-login guide: dimmed overlay with a step card. Skip or finish marks it seen. */
export function PortalGuide({ visible, onDone }: PortalGuideProps) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const step = GUIDE_STEPS[index] ?? GUIDE_STEPS[0]!;
  const isLast = index === GUIDE_STEPS.length - 1;
  const Icon = step.icon;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onDone}
    >
      <View style={styles.scrim}>
        <Pressable
          onPress={onDone}
          style={[styles.skip, { top: insets.top + 40 }]}
          accessibilityRole="button"
          accessibilityLabel="Skip guide"
        >
          <Text variant="caption" style={styles.skipText}>
            Skip
          </Text>
        </Pressable>

        <View style={styles.card}>
          <Hero />
          <View style={styles.iconTile}>
            <Icon size={22} color={colors.brand} strokeWidth={2} />
          </View>
          <View style={styles.body}>
            <View style={styles.copy}>
              <Text style={styles.title} accessibilityRole="header">
                {step.title}
              </Text>
              <Text color="inkMuted">{step.body}</Text>
            </View>
            <View style={styles.footer}>
              <View
                style={styles.dots}
                accessible
                accessibilityLabel={`Step ${index + 1} of ${GUIDE_STEPS.length}`}
              >
                {GUIDE_STEPS.map((s, i) => (
                  <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
                ))}
              </View>
              <Pressable
                onPress={() => (isLast ? onDone() : setIndex(index + 1))}
                style={({ pressed }) => [styles.next, pressed && styles.nextPressed]}
                accessibilityRole="button"
                accessibilityLabel={isLast ? 'Get started' : 'Next'}
              >
                <Text style={styles.nextLabel}>{isLast ? 'Get started' : 'Next'}</Text>
                {!isLast && <ChevronRight size={16} color={colors.onAccent} strokeWidth={2.5} />}
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Violet 135° gradient band with a faint sparkle, from the design. */
function Hero() {
  return (
    <View style={styles.hero}>
      <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="guideHero" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.brand} />
            <Stop offset="0.6" stopColor={colors.brandDeep} />
            <Stop offset="1" stopColor={colors.brandNight} />
          </LinearGradient>
        </Defs>
        <Rect width="100" height="100" fill="url(#guideHero)" />
      </Svg>
      <View style={styles.heroSpark}>
        <Sparkles size={18} color={colors.onBrandFaint} strokeWidth={2} />
      </View>
    </View>
  );
}
