/**
 * Design tokens — the only place raw colour / size values may live.
 * Modernist: flat, zero radius, 2px rules, single red accent.
 */

export const colors = {
  ground: '#F3F2F2', // app background
  surface: '#FFFFFF', // cards, inputs, sheets
  ink: '#201E1D', // primary text, strong rules
  inkMuted: '#5E5A57', // secondary text (6.1:1 on ground)
  inkSubtle: '#8C8885', // placeholders, disabled text — not for body copy
  line: '#201E1D', // 2px structural dividers
  lineSoft: '#D9D7D6', // 1px row separators
  accent: '#EC3013', // primary action fill, status emphasis
  accentText: '#B3230E', // small red text (5.9:1 on ground)
  accentPressed: '#C92710',
  onAccent: '#FFFFFF',
  onInk: '#FFFFFF',
  success: '#1E6B3A',
  warning: '#8A5300',
  info: '#1F4E8C',
  successBg: '#E3EEE6',
  warningBg: '#F4EADB',
  infoBg: '#E1E8F2',
  accentBg: '#FBE3DF',
  neutralBg: '#E6E4E3',
  skeleton: '#E2E0DF',
  scrim: 'rgba(32, 30, 29, 0.4)',
  // Brand splash (M0) — violet gradient, glows and grid.
  brand: '#4A34C7',
  brandDeep: '#372697',
  brandNight: '#1B1740',
  brandSplash: '#39279B', // gradient colour at screen centre; mirrors splash backgroundColor in app.config.js
  brandGlowViolet: '#8B7CF0',
  brandGlowTeal: '#2CB8A6',
  brandGrid: 'rgba(255, 255, 255, 0.06)',
  onBrandMuted: 'rgba(255, 255, 255, 0.7)',
  // Onboarding (M0.5) — cool canvas with faint violet / teal / peach mesh.
  canvas: '#F4F5F6',
  dotIdle: 'rgba(30, 32, 36, 0.22)',
  meshViolet: '#3A2AC9',
  meshTeal: '#2CB8A6',
  meshPeach: '#FF8A5C',
  // Sign in (M1) — outlined controls and decorative shapes.
  control: '#CDD1D6', // input / outline-button border
  divider: '#E1E3E7',
  brandTint: '#EDEBFA',
  brandTintStrong: '#D8D3F4',
  amberTint: '#FBF1DF',
  tealTint: '#DDF3EF',
  tealTintStrong: '#B9E6DE',
  // Home (M2) — status tones, tab bar, portal guide.
  amber: '#A96A06',
  amberBorder: '#EFDCB6',
  danger: '#B4231A',
  dangerTint: '#FAEBE9',
  dangerBorder: '#EFC8C4',
  fill: '#EEEFF2',
  guideScrim: 'rgba(20, 18, 40, 0.55)',
  onBrandFaint: 'rgba(255, 255, 255, 0.55)',
  // Camera (M6) — dark capture surface.
  camera: '#111014',
  cameraViewfinder: '#1D1C24',
  cameraLine: 'rgba(255, 255, 255, 0.18)',
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = 0;

export const borders = {
  strong: 2,
  hairline: 1,
} as const;

export const fontFamily = {
  regular: 'Archivo_400Regular',
  medium: 'Archivo_500Medium',
  semibold: 'Archivo_600SemiBold',
  bold: 'Archivo_700Bold',
  extrabold: 'Archivo_800ExtraBold',
} as const;

export const typeScale = {
  display: { fontFamily: fontFamily.extrabold, fontSize: 32, lineHeight: 36, letterSpacing: -0.5 },
  title: { fontFamily: fontFamily.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.3 },
  heading: { fontFamily: fontFamily.bold, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fontFamily.regular, fontSize: 16, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamily.semibold, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fontFamily.semibold, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: fontFamily.bold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
} as const;

export type TypeVariant = keyof typeof typeScale;

export const layout = {
  minTapTarget: 44,
  buttonHeight: 52,
  inputHeight: 52,
  maxFontScale: 1.6,
} as const;

export const motion = {
  fast: 150,
  base: 250,
  toastDuration: 3500,
} as const;

/** M0 splash geometry. The card must match assets/splash-icon.png (144×76, imageWidth 144). */
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

/** Brand controls from the M0.5+ designs: rounded buttons and fields. */
export const brandControl = {
  radius: 8,
  height: 52,
  secondaryHeight: 48,
} as const;

/** M0.5 onboarding geometry. */
export const onboarding = {
  imageSize: 220,
  imageRadius: 20,
  dot: 7,
  dotActiveWidth: 18,
  textMaxWidth: 300,
} as const;

/** Sheets, plus the soft lift under the M2+ rounded cards. */
export const elevation = {
  card: {
    shadowColor: '#23211E',
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  sheet: {
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
} as const;
