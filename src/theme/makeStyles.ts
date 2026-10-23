import { StyleSheet } from 'react-native';

import { palettes, type ColorScheme, type ThemeColors } from './palette';
import { useTheme } from './useTheme';

/**
 * Themed StyleSheet factory. Call at module level; use the returned hook in the component:
 *
 *   const useStyles = makeStyles((c) => ({ card: { backgroundColor: c.card } }));
 *   const styles = useStyles();
 *
 * Each scheme's sheet is built once and reused.
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: ThemeColors) => T,
): () => T {
  const cache: Partial<Record<ColorScheme, T>> = {};
  return function useStyles() {
    const { scheme } = useTheme();
    cache[scheme] ??= StyleSheet.create(factory(palettes[scheme]));
    return cache[scheme];
  };
}
