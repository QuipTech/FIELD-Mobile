import { light as c } from './palette';

/**
 * @deprecated Light-only aliases for screens not yet moved to `makeStyles` / `useTheme`.
 * Each delivery step migrates its screens and deletes the keys it no longer needs; the file
 * goes away with the last one. New code must not import these.
 */
export const colors = {
  ground: c.bg,
  canvas: c.bg,
  surface: c.card,
  ink: c.ink,
  inkMuted: c.muted,
  inkSubtle: c.faint,
  line: c.borderStrong,
  lineSoft: c.border,
  control: c.borderStrong,
  divider: c.border,
  accent: c.button,
  accentText: c.danger,
  accentPressed: c.primaryStrong,
  accentBg: c.primaryTint,
  onAccent: c.onButton,
  onInk: c.onButton,
  success: c.success,
  successBg: c.successTint,
  warning: c.warning,
  warningBg: c.warningTint,
  info: c.primaryStrong,
  infoBg: c.primaryTint,
  neutralBg: c.fill,
  fill: c.fill,
  skeleton: c.fill,
  scrim: c.scrim,
  guideScrim: c.scrim,
  brand: c.primary,
  brandDeep: c.primaryStrong,
  brandTint: c.primaryTint,
  brandTintStrong: c.primaryTintStrong,
  brandSplash: c.brandSplash,
  brandNight: c.brandNight,
  brandGlowViolet: c.scanLine,
  brandGlowTeal: c.success,
  brandGrid: c.cameraLine,
  onBrandMuted: c.onBrandMuted,
  onBrandFaint: c.onBrandMuted,
  dotIdle: c.borderStrong,
  meshViolet: c.primary,
  meshTeal: c.successTint,
  meshPeach: c.warningTint,
  amber: c.warning,
  amberTint: c.warningTint,
  amberBorder: c.warningTint,
  tealTint: c.successTint,
  tealTintStrong: c.successTint,
  danger: c.danger,
  dangerTint: c.dangerTint,
  dangerBorder: c.dangerTint,
  camera: c.camera,
  cameraViewfinder: c.camera,
  cameraLine: c.cameraLine,
} as const;

/** @deprecated Use `radii`. */
export const radius = 0;

/** @deprecated Use `radii.control` / `layout.buttonHeight`. */
export const brandControl = {
  radius: 12,
  height: 52,
  secondaryHeight: 48,
} as const;

/** @deprecated Use `durations` from motion.ts. */
export const motion = { fast: 150, base: 240, toastDuration: 2500 } as const;

/** A0 splash geometry. The card must match assets/splash-icon.png (144×76, imageWidth 144). */
export const splash = {
  cardRadius: 16,
  cardPaddingX: 16,
  cardPaddingY: 10,
  logoWidth: 112,
  logoHeight: 56,
  gridSize: 44,
  minVisibleMs: 1200,
  fadeOutMs: 400,
} as const;

/** A1 onboarding geometry. */
export const onboarding = {
  imageSize: 220,
  imageRadius: 20,
  dot: 8,
  dotActiveWidth: 22,
  textMaxWidth: 300,
} as const;
