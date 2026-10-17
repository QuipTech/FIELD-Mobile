import { StyleSheet } from 'react-native';

import { fontFamily, spacing } from '@/theme';

export const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  list: { marginTop: -spacing.xxs },
  splitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  question: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 22 },
});
