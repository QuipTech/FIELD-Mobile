import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Image, useWindowDimensions, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/Text/Text';
import { colors, splash } from '@/theme';
import { styles } from './styles';

const logo = require('../../../assets/logo.png');

export type BrandSplashProps = {
  /** True once the app is ready; the splash then fades out (after a minimum display time). */
  ready: boolean;
  onFinish: () => void;
};

/**
 * M0 Splash. Takes over from the native splash (same card, same centre) and adds the
 * gradient, drifting glows and grid that the native splash cannot render.
 */
export function BrandSplash({ ready, onFinish }: BrandSplashProps) {
  const { width, height } = useWindowDimensions();
  const [opacity] = useState(() => new Animated.Value(1));
  const [drift] = useState(() => new Animated.Value(0));
  const [mountedAt] = useState(() => Date.now());

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration: 11000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  useEffect(() => {
    if (!ready) return;
    const wait = Math.max(0, splash.minVisibleMs - (Date.now() - mountedAt));
    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: splash.fadeOutMs,
        useNativeDriver: true,
      }).start(({ finished }) => finished && onFinish());
    }, wait);
    return () => clearTimeout(timer);
  }, [ready, mountedAt, opacity, onFinish]);

  // Gradient and grid fill the window in absolute units so the 150° angle matches CSS.
  const gradient = useMemo(() => cssAngleLine(150, width, height), [width, height]);
  const gridPath = useMemo(() => buildGridPath(width, height, splash.gridSize), [width, height]);

  // Glow drift: 0 → 24,-28 @ 1.1× → 0 over one cycle; the teal glow drifts in counter-phase.
  const violetDrift = useMemo(() => driftStyle(drift, [0, 1, 0]), [drift]);
  const tealDrift = useMemo(() => driftStyle(drift, [1, 0, 1]), [drift]);

  return (
    <Animated.View
      style={[styles.root, { opacity }]}
      pointerEvents={ready ? 'none' : 'auto'}
      onLayout={() => SplashScreen.hideAsync().catch(() => undefined)}
      accessibilityLabel="QuipTech FIELD. Built for the field."
      accessible
    >
      <StatusBar style="light" />

      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id="bg" gradientUnits="userSpaceOnUse" {...gradient}>
            <Stop offset="0" stopColor={colors.brand} />
            <Stop offset="0.55" stopColor={colors.brandDeep} />
            <Stop offset="1" stopColor={colors.brandNight} />
          </LinearGradient>
        </Defs>
        <Rect width={width} height={height} fill="url(#bg)" />
      </Svg>

      <Animated.View style={[styles.blobViolet, violetDrift]}>
        <Glow id="violet" size={220} color={colors.brandGlowViolet} />
      </Animated.View>
      <Animated.View style={[styles.blobTeal, tealDrift]}>
        <Glow id="teal" size={260} color={colors.brandGlowTeal} />
      </Animated.View>

      <Svg width={width} height={height} style={{ position: 'absolute' }}>
        <Path d={gridPath} stroke={colors.brandGrid} strokeWidth={1} />
      </Svg>

      <View style={styles.card}>
        <Image source={logo} style={styles.logo} resizeMode="contain" />
        {/* Archivo isn't loaded until `ready`; the native splash has no tagline either. */}
        {ready && (
          <Text variant="caption" color="onBrandMuted" style={styles.tagline}>
            Built for the field
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const GLOW_BLUR = 60;
const GLOW_OPACITY = 0.5;

/** A soft circle approximating CSS `filter: blur(60px)` on a `size`-diameter disc. */
function Glow({ id, size, color }: { id: string; size: number; color: string }) {
  const radius = size / 2 + GLOW_BLUR * 1.5;
  const core = (size / 2 - GLOW_BLUR) / radius;
  const edge = size / 2 / radius;
  return (
    <Svg width={radius * 2} height={radius * 2}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={GLOW_OPACITY} />
          <Stop offset={core} stopColor={color} stopOpacity={GLOW_OPACITY} />
          <Stop offset={edge} stopColor={color} stopOpacity={GLOW_OPACITY / 2} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={radius * 2} height={radius * 2} fill={`url(#${id})`} />
    </Svg>
  );
}

function driftStyle(drift: Animated.Value, curve: number[]) {
  const p = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: curve });
  return {
    transform: [
      { translateX: p.interpolate({ inputRange: [0, 1], outputRange: [0, 24] }) },
      { translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, -28] }) },
      { scale: p.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] }) },
    ],
  };
}

/** Start/end points of a CSS `linear-gradient(<deg>)` line across a w×h box. */
function cssAngleLine(deg: number, w: number, h: number) {
  const rad = (deg * Math.PI) / 180;
  const dx = Math.sin(rad);
  const dy = -Math.cos(rad);
  const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
  return {
    x1: w / 2 - dx * half,
    y1: h / 2 - dy * half,
    x2: w / 2 + dx * half,
    y2: h / 2 + dy * half,
  };
}

function buildGridPath(w: number, h: number, step: number) {
  let d = '';
  for (let x = step; x < w; x += step) d += `M${x} 0V${h}`;
  for (let y = step; y < h; y += step) d += `M0 ${y}H${w}`;
  return d;
}
