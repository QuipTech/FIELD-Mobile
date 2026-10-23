/**
 * Design tokens other than colour (colours live in palette.ts). Values from the FIELD design.
 * Keys marked "legacy" keep un-migrated screens compiling; remove them as screens move over.
 */

/** Design scale: 4 / 8 / 10 / 12 / 14 / 16 / 20 / 24. */
export const spacing = {
  xxs: 4,
  xs: 8,
  tight: 10,
  sm: 12,
  snug: 14,
  md: 16,
  loose: 20,
  lg: 24,
  /** Legacy: not on the design scale. */
  xl: 32,
} as const;

export const radii = {
  card: 14,
  control: 12, // inputs, buttons, icon buttons
  small: 10, // small buttons, citation chips
  chip: 22, // pill
  badge: 6,
  sheet: 22, // top corners only
  round: 999,
} as const;

/** Border widths: cards/rows use hairlines, controls use the 1.5 px outline. */
export const borders = { hairline: 1, control: 1.5, strong: 2 } as const;

/** IBM Plex Sans; only 400 / 500 / 600 are loaded. */
export const fontFamily = {
  regular: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semibold: 'IBMPlexSans_600SemiBold',
  /** Legacy weights, mapped onto the loaded 600. */
  bold: 'IBMPlexSans_600SemiBold',
  extrabold: 'IBMPlexSans_600SemiBold',
} as const;

const plex = (family: string, fontSize: number, lineHeight: number) => ({
  fontFamily: family,
  fontSize,
  lineHeight,
});

export const typeScale = {
  title: plex(fontFamily.semibold, 26, 31),
  sheetTitle: plex(fontFamily.semibold, 20, 26),
  section: plex(fontFamily.semibold, 17, 22),
  body: plex(fontFamily.regular, 16, 22),
  bodyMedium: plex(fontFamily.medium, 16, 22),
  bodyStrong: plex(fontFamily.semibold, 16, 22),
  row: plex(fontFamily.medium, 15, 20),
  label: plex(fontFamily.medium, 14, 19),
  caption: plex(fontFamily.regular, 13, 18),
  badge: { ...plex(fontFamily.semibold, 12, 16), letterSpacing: 0.12 },
  /** Big KPI number on Home. */
  kpi: plex(fontFamily.semibold, 28, 31),
  // Legacy variants.
  display: plex(fontFamily.semibold, 26, 31),
  heading: plex(fontFamily.semibold, 17, 22),
  overline: { ...plex(fontFamily.medium, 12, 16), letterSpacing: 0.72, textTransform: 'uppercase' },
} as const;

export type TypeVariant = keyof typeof typeScale;

/** Field-use sizes: every target is at least 48, so it works with gloves. */
export const layout = {
  minTapTarget: 48,
  buttonHeight: 52,
  smallButtonHeight: 44,
  chipHeight: 44,
  inputHeight: 52,
  rowHeight: 64,
  headerHeight: 56,
  tabBarHeight: 80,
  iconSize: 20,
  maxFontScale: 1.6,
} as const;

/** Card lift from the design (`--sh`); the palette makes it transparent in dark. */
export const elevation = {
  card: {
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  fab: {
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  sheet: {
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
} as const;
