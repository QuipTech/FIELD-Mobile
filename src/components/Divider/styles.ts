import { StyleSheet } from 'react-native';

import { borders, colors } from '@/theme';

export const styles = StyleSheet.create({
  strong: { height: borders.strong, backgroundColor: colors.line },
  soft: { height: borders.hairline, backgroundColor: colors.lineSoft },
});
