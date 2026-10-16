import { useWindowDimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/theme';

/** One CSS-style `radial-gradient(circle at cx cy, color, transparent reach)` glow. */
export type MeshSpot = {
  id: string;
  /** Centre as a fraction of width / height (may sit outside 0–1, like the CSS). */
  cx: number;
  cy: number;
  color: string;
  opacity: number;
  /** Fade-out point as a fraction of the distance to the farthest corner. */
  reach: number;
};

/** Onboarding `.msh` mesh. */
export const ONBOARDING_MESH: MeshSpot[] = [
  { id: 'v', cx: 0.08, cy: 0.04, color: colors.meshViolet, opacity: 0.05, reach: 0.3 },
  { id: 't', cx: 1, cy: 0.18, color: colors.meshTeal, opacity: 0.06, reach: 0.32 },
  { id: 'p', cx: 0.9, cy: 0.96, color: colors.meshPeach, opacity: 0.045, reach: 0.3 },
];

/** Signed-in screens' `.modshapes` mesh. */
export const APP_MESH: MeshSpot[] = [
  { id: 'v', cx: 0.12, cy: -0.06, color: colors.meshViolet, opacity: 0.07, reach: 0.42 },
  { id: 't', cx: 1.04, cy: 0.26, color: colors.meshTeal, opacity: 0.08, reach: 0.46 },
  { id: 'p', cx: 0.2, cy: 1.08, color: colors.meshPeach, opacity: 0.06, reach: 0.4 },
];

/** Faint full-screen corner glows behind content. */
export function MeshBackground({ spots }: { spots: MeshSpot[] }) {
  const { width: w, height: h } = useWindowDimensions();
  return (
    <Svg width={w} height={h} style={{ position: 'absolute' }} pointerEvents="none">
      <Defs>
        {spots.map((m) => {
          // CSS circle radius = distance to the farthest corner.
          const fx = Math.max(Math.abs(m.cx), Math.abs(1 - m.cx)) * w;
          const fy = Math.max(Math.abs(m.cy), Math.abs(1 - m.cy)) * h;
          return (
            <RadialGradient
              key={m.id}
              id={`mesh-${m.id}`}
              gradientUnits="userSpaceOnUse"
              cx={m.cx * w}
              cy={m.cy * h}
              r={Math.hypot(fx, fy) * m.reach}
            >
              <Stop offset="0" stopColor={m.color} stopOpacity={m.opacity} />
              <Stop offset="1" stopColor={m.color} stopOpacity={0} />
            </RadialGradient>
          );
        })}
      </Defs>
      {spots.map((m) => (
        <Rect key={m.id} width={w} height={h} fill={`url(#mesh-${m.id})`} />
      ))}
    </Svg>
  );
}
