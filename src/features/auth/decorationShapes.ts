import type { ViewStyle } from 'react-native';

import { colors } from '@/theme';

export type ShapeKind = 'outline' | 'tile' | 'dot' | 'ring' | 'pill' | 'plus';
export type ShapeTone = 'violet' | 'amber' | 'teal';

/**
 * Wander path: x and y each swing by dx / dy on their own loop. The y loop runs ~1.4x slower than
 * x, so each shape traces a slow figure-of-eight instead of sliding back and forth.
 */
export type Drift = {
  dx: number;
  dy: number;
  spin: number;
  periodMs: number;
  delayMs: number;
};

type Position = Pick<ViewStyle, 'top' | 'bottom' | 'left' | 'right'>;

export type ShapeSpec = {
  kind: ShapeKind;
  tone: ShapeTone;
  size: number;
  at: Position;
  rotate: number;
  drift: Drift;
};

const tones: Record<ShapeTone, { fill: string; line: string }> = {
  violet: { fill: colors.brandTint, line: colors.brandTintStrong },
  amber: { fill: colors.amberTint, line: colors.amberBorder },
  teal: { fill: colors.tealTint, line: colors.tealTintStrong },
};

/** Box style for a shape. `plus` is drawn by its two bars (see `plusBar`). */
export function shapeStyle({ kind, tone, size }: ShapeSpec): ViewStyle {
  const { fill, line } = tones[tone];
  const box: ViewStyle = { position: 'absolute', width: size, height: size };
  switch (kind) {
    case 'outline':
      return {
        ...box,
        borderWidth: 1.5,
        borderColor: line,
        borderRadius: size * 0.22,
      };
    case 'tile':
      return { ...box, backgroundColor: fill, borderRadius: size * 0.26 };
    case 'dot':
      return { ...box, backgroundColor: fill, borderRadius: size / 2 };
    case 'ring':
      return {
        ...box,
        borderWidth: 2,
        borderColor: line,
        borderRadius: size / 2,
      };
    case 'pill':
      return {
        ...box,
        height: size * 0.4,
        backgroundColor: fill,
        borderRadius: size,
      };
    case 'plus':
      return box;
  }
}

export function plusBar({ tone, size }: ShapeSpec, vertical: boolean): ViewStyle {
  const thick = Math.max(3, Math.round(size * 0.24));
  const offset = (size - thick) / 2;
  return {
    position: 'absolute',
    backgroundColor: tones[tone].line,
    borderRadius: thick / 2,
    ...(vertical
      ? { top: 0, bottom: 0, left: offset, width: thick }
      : { left: 0, right: 0, top: offset, height: thick }),
  };
}

function shape(
  kind: ShapeKind,
  tone: ShapeTone,
  size: number,
  at: Position,
  [dx, dy, spin]: [number, number, number],
  periodS: number,
  rotate = 0,
): ShapeSpec {
  return {
    kind,
    tone,
    size,
    at,
    rotate,
    drift: { dx, dy, spin, periodMs: periodS * 1000, delayMs: 0 },
  };
}

/** Staggers start times so the shapes never move in lockstep. */
const staggered = (specs: ShapeSpec[]) =>
  specs.map((s, i) => ({
    ...s,
    drift: { ...s.drift, delayMs: (i * 700) % 4200 },
  }));

/**
 * Where the shapes sit on each screen. Sign in keeps them in the open bands above the logo and
 * below the links; the others use each screen's open space. Shapes passing behind a control are
 * hidden by its solid background.
 */
export const shapePlacements = {
  signIn: staggered([
    shape('outline', 'violet', 46, { top: 26, right: 34 }, [-18, 26, 40], 9, 18),
    shape('dot', 'amber', 26, { top: 78, left: 26 }, [24, -16, 0], 7),
    shape('ring', 'teal', 58, { top: 150, left: -20 }, [28, 22, 0], 11),
    shape('plus', 'violet', 18, { top: 128, right: 74 }, [-22, 18, 120], 8, 10),
    shape('tile', 'amber', 22, { top: 112, left: 104 }, [18, 24, -60], 10, 24),
    shape('pill', 'teal', 40, { top: 210, right: -8 }, [-26, 20, 30], 12, -30),
    shape('tile', 'violet', 34, { bottom: 150, right: 20 }, [-20, -28, -50], 10, 30),
    shape('dot', 'teal', 96, { bottom: -36, left: -34 }, [26, -22, 0], 14),
    shape('pill', 'amber', 42, { bottom: 72, left: 64 }, [24, -18, 40], 9, 20),
    shape('outline', 'teal', 30, { bottom: 44, right: 110 }, [-18, -20, 90], 11, -12),
    shape('plus', 'amber', 16, { bottom: 110, right: 62 }, [16, -22, -120], 8),
    shape('dot', 'violet', 14, { bottom: 116, left: 30 }, [20, 14, 0], 6),
  ]),
  // The form fills the middle, so these stay in the 28pt side gutters and the bottom corners.
  register: staggered([
    shape('ring', 'teal', 52, { top: '30%', left: -30 }, [6, 24, 0], 11),
    shape('outline', 'violet', 34, { top: '58%', right: -18 }, [-6, -22, 40], 9, 18),
    shape('plus', 'violet', 14, { top: '45%', left: 6 }, [6, 20, 90], 8),
    shape('pill', 'amber', 34, { top: '78%', left: -14 }, [6, 18, 20], 12, -20),
    shape('dot', 'amber', 12, { top: 4, right: 60 }, [-14, 6, 0], 7),
    shape('dot', 'teal', 90, { bottom: -44, right: -36 }, [-14, -10, 0], 14),
    shape('tile', 'violet', 24, { bottom: 30, left: 44 }, [16, -8, -50], 10, 30),
    shape('plus', 'amber', 14, { bottom: 22, left: 150 }, [20, 6, 120], 8),
  ]),
  // M1f: form at the top, open space below.
  twoFactor: staggered([
    shape('outline', 'violet', 46, { bottom: 120, left: 30 }, [20, -24, 40], 9, 18),
    shape('dot', 'amber', 26, { bottom: 200, right: 56 }, [-22, 18, 0], 7),
    shape('tile', 'violet', 34, { bottom: 48, right: 26 }, [-18, -22, -50], 10, 30),
    shape('ring', 'teal', 52, { bottom: 150, right: -18 }, [-24, 20, 0], 11),
    shape('plus', 'violet', 18, { bottom: 70, left: 120 }, [18, -16, 120], 8),
    shape('pill', 'amber', 40, { bottom: 24, left: -6 }, [22, -14, 30], 12, -20),
    shape('dot', 'teal', 16, { bottom: 240, left: 70 }, [-16, 18, 0], 6),
  ]),
  // M1c–M1e: either side of the header, plus the open middle between header and form.
  step: staggered([
    shape('outline', 'violet', 46, { top: 30, right: 34 }, [-18, 24, 40], 9, 18),
    shape('dot', 'amber', 26, { top: 96, left: 28 }, [22, -14, 0], 7),
    shape('tile', 'violet', 34, { top: '42%', right: 40 }, [-20, 26, -50], 10, 30),
    shape('ring', 'teal', 56, { top: '34%', left: -18 }, [26, 20, 0], 11),
    shape('plus', 'amber', 16, { top: 150, right: 90 }, [-16, 18, -120], 8),
    shape('pill', 'teal', 38, { top: '50%', left: 90 }, [22, -18, 30], 12, -24),
    shape('dot', 'violet', 14, { top: '28%', right: 24 }, [-14, 20, 0], 6),
  ]),
} as const;

export type ShapePlacement = keyof typeof shapePlacements;
