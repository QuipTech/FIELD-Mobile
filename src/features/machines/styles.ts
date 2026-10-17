import { StyleSheet } from 'react-native';

import { brandControl, colors, fontFamily, spacing } from '@/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.md, gap: spacing.sm },

  // M3 search bar (white, hairline) with the scan button
  searchBar: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  search: { flex: 1 },
  scan: {
    width: 48,
    height: 48,
    borderRadius: brandControl.radius,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanPressed: { backgroundColor: colors.brandDeep },
  filters: { gap: spacing.xs, paddingRight: spacing.md },
  filterScroll: { marginHorizontal: -spacing.md, paddingLeft: spacing.md, flexGrow: 0 },

  // Rows and cards
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowText: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 21 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fill,
  },
  iconButton: {
    width: 44,
    height: 44,
    marginRight: -spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.6 },
  footnote: { textAlign: 'center', marginTop: spacing.xs },

  // M4 hero and specs
  hero: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  heroImage: { height: 170, borderRadius: 12, backgroundColor: colors.fill },
  heroTitle: { fontFamily: fontFamily.medium, fontSize: 17, lineHeight: 22 },
  specs: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  panel: { gap: spacing.sm },
  seeAll: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  seeAllText: { fontFamily: fontFamily.medium },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
