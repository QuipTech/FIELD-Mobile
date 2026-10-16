import { useRef, useState } from 'react';
import {
  FlatList,
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { MeshBackground, ONBOARDING_MESH } from '@/components/MeshBackground/MeshBackground';
import { Text } from '@/components/Text/Text';
import { SLIDES, type Slide } from './slides';
import { styles } from './styles';

export type OnboardingProps = {
  /** Called from Skip, or Next on the last slide. */
  onDone: () => void;
};

/** M0.5 Onboarding — swipeable intro slides shown to signed-out users after the splash. */
export function Onboarding({ onDone }: OnboardingProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const list = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));

  const next = () => {
    if (isLast) return onDone();
    list.current?.scrollToIndex({ index: index + 1 });
    setIndex(index + 1);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <MeshBackground spots={ONBOARDING_MESH} />

      <View style={styles.topBar}>
        <Pressable
          onPress={onDone}
          style={styles.skip}
          accessibilityRole="button"
          accessibilityLabel="Skip introduction"
          hitSlop={8}
        >
          <Text variant="label" color="brand">
            Skip
          </Text>
        </Pressable>
      </View>

      <FlatList
        ref={list}
        data={SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScrollEnd}
        getItemLayout={(_, i) => ({
          length: width,
          offset: width * i,
          index: i,
        })}
        style={styles.pager}
        renderItem={({ item }) => <SlideView slide={item} width={width} />}
      />

      <Dots index={index} />

      <View style={styles.footer}>
        <BrandButton label={isLast ? 'Get started' : 'Next'} onPress={next} />
      </View>
    </View>
  );
}

function SlideView({ slide, width }: { slide: Slide; width: number }) {
  return (
    <View style={[styles.slide, { width }]}>
      <Image source={slide.image} style={styles.image} resizeMode="cover" />
      <View style={styles.copy}>
        <Text variant="title" style={styles.title} accessibilityRole="header">
          {slide.title}
        </Text>
        <Text variant="caption" color="inkMuted" style={styles.body}>
          {slide.body}
        </Text>
      </View>
    </View>
  );
}

function Dots({ index }: { index: number }) {
  return (
    <View
      style={styles.dots}
      accessible
      accessibilityLabel={`Slide ${index + 1} of ${SLIDES.length}`}
    >
      {SLIDES.map((s, i) => (
        <View key={s.key} style={[styles.dot, i === index && styles.dotActive]} />
      ))}
    </View>
  );
}
