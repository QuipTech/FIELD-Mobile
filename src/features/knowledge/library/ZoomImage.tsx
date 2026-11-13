import { X } from 'lucide-react-native';
import { Image, Modal, Pressable, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text/Text';
import { makeStyles, useTheme } from '@/theme';

/** Pinch to zoom (1–6×), drag when zoomed, double-tap to reset. */
function useZoom() {
  const scale = useSharedValue(1);
  const saved = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const reset = () => {
    'worklet';
    scale.set(withTiming(1));
    saved.set(1);
    x.set(withTiming(0));
    y.set(withTiming(0));
  };
  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.set(Math.min(6, Math.max(1, saved.get() * e.scale)));
    })
    .onEnd(() => {
      saved.set(scale.get());
      if (scale.get() <= 1.01) reset();
    });
  const pan = Gesture.Pan()
    .minPointers(1)
    .onStart(() => {
      startX.set(x.get());
      startY.set(y.get());
    })
    .onUpdate((e) => {
      if (scale.get() <= 1) return;
      x.set(startX.get() + e.translationX);
      y.set(startY.get() + e.translationY);
    });
  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => reset());
  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: scale.get() }],
  }));

  return { gesture: Gesture.Simultaneous(pinch, pan, doubleTap), style };
}

/** A figure full screen: pinch to zoom, drag when zoomed, double-tap to reset. */
export function ZoomImage({
  uri,
  caption,
  onClose,
}: {
  uri?: string;
  caption?: string;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { gesture, style } = useZoom();

  return (
    <Modal visible={!!uri} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={styles.root}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.fill, style]}>
            {uri && (
              <Image
                source={{ uri }}
                style={styles.fill}
                resizeMode="contain"
                accessibilityLabel={caption || 'Figure'}
              />
            )}
          </Animated.View>
        </GestureDetector>
        {!!caption && (
          <View style={[styles.caption, { paddingBottom: insets.bottom + 12 }]}>
            <Text variant="caption" color="onCamera">
              {caption}
            </Text>
          </View>
        )}
        <Pressable
          onPress={onClose}
          style={[styles.close, { top: insets.top + 8 }]}
          accessibilityRole="button"
          accessibilityLabel="Close image"
          hitSlop={8}
        >
          <X size={24} color={colors.onCamera} strokeWidth={2} />
        </Pressable>
      </GestureHandlerRootView>
    </Modal>
  );
}

// The camera tokens: a dark viewer in both themes, like the system Photos app.
const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.camera },
  fill: { flex: 1, width: '100%' },
  caption: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16 },
  close: {
    position: 'absolute',
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.scrim,
  },
}));
