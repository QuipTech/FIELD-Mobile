/**
 * Colour palettes for both themes — the only file in the app where raw colour values live.
 * Values come from the FIELD design (design/mobile-app-complete.html, `:root` and `.dk`).
 * Every text/background pair used by the design meets 4.5:1 in both themes.
 */

export type ThemeColors = {
  /** Text and links in the brand colour. */
  primary: string;
  /** Text on `primaryTint` (selected chips, citation chips, active tab label). */
  primaryStrong: string;
  primaryTint: string;
  /** Pressed / stronger tint, e.g. a pressed selected chip. */
  primaryTintStrong: string;
  /** Filled button background. */
  button: string;
  buttonPressed: string;
  /** Text and icons on `button`. */
  onButton: string;
  ink: string;
  muted: string;
  /** Placeholders, idle tab labels, timestamps. Not for body copy. */
  faint: string;
  bg: string;
  card: string;
  border: string;
  borderStrong: string;
  fill: string;
  warning: string;
  warningTint: string;
  danger: string;
  dangerTint: string;
  success: string;
  successTint: string;
  /** Search-term highlight (`<mark>`). */
  highlight: string;
  /** Cited-section box in the document viewer. */
  highlightBox: string;
  highlightOutline: string;
  scrim: string;
  /** Card shadow colour; transparent in dark, where cards rely on borders. */
  shadow: string;
  // Camera and splash surfaces are dark in both themes.
  camera: string;
  cameraLine: string;
  onCamera: string;
  scanLine: string;
  brandSplash: string;
  brandNight: string;
  onBrandMuted: string;
};

export const light: ThemeColors = {
  primary: '#4A34C7',
  primaryStrong: '#372697',
  primaryTint: '#EDEBFA',
  primaryTintStrong: '#D8D3F4',
  button: '#4A34C7',
  buttonPressed: '#372697',
  onButton: '#FFFFFF',
  ink: '#1E2024',
  muted: '#545860',
  // Design value #71767F is 4.2:1 on bg; darkened to the nearest shade that meets 4.5:1.
  faint: '#686D76',
  bg: '#F4F5F6',
  card: '#FFFFFF',
  border: '#E1E3E7',
  borderStrong: '#CDD1D6',
  fill: '#EEEFF2',
  warning: '#855300',
  warningTint: '#FBF1DF',
  danger: '#B4231A',
  dangerTint: '#FAEBE9',
  success: '#1F7A3D',
  successTint: '#E4F3E9',
  highlight: '#FFE27A',
  highlightBox: '#FFF6D1',
  highlightOutline: '#E0B400',
  scrim: 'rgba(20, 21, 26, 0.45)',
  shadow: 'rgba(35, 33, 30, 1)',
  camera: '#111014',
  cameraLine: 'rgba(255, 255, 255, 0.18)',
  onCamera: '#FFFFFF',
  scanLine: '#8F80F5',
  brandSplash: '#39279B',
  brandNight: '#1B1740',
  onBrandMuted: 'rgba(255, 255, 255, 0.7)',
};

export const dark: ThemeColors = {
  ...light,
  primary: '#8F80F5',
  primaryStrong: '#CEC7FF',
  primaryTint: '#27234A',
  primaryTintStrong: '#3B356F',
  button: '#6352E0',
  buttonPressed: '#5241C8',
  ink: '#EDEEF1',
  muted: '#B3B7BF',
  faint: '#8F949D',
  bg: '#111216',
  card: '#1B1D22',
  border: '#2B2E35',
  borderStrong: '#3B3F48',
  fill: '#24272E',
  warning: '#F3B759',
  warningTint: '#3A2C12',
  danger: '#FF8F85',
  dangerTint: '#3D1D1B',
  success: '#74D69A',
  successTint: '#16301F',
  highlight: '#7A6200',
  highlightBox: '#2E2810',
  highlightOutline: '#E0B400',
  scrim: 'rgba(0, 0, 0, 0.6)',
  shadow: 'transparent',
};

export const palettes = { light, dark } as const;
export type ColorScheme = keyof typeof palettes;
