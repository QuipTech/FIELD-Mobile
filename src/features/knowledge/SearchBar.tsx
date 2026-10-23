import { Search, X } from 'lucide-react-native';
import { Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { borders, layout, makeStyles, radii, spacing, typeScale, useTheme } from '@/theme';

/** K4 top bar: focused search field with a clear button, and Cancel. */
export function SearchBar({
  query,
  onQuery,
  onCancel,
}: {
  query: string;
  onQuery: (q: string) => void;
  onCancel: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.bar}>
      <View style={styles.field}>
        <Search size={layout.iconSize} color={colors.faint} strokeWidth={1.8} />
        <TextInput
          value={query}
          onChangeText={onQuery}
          autoFocus
          placeholder="Search manuals, bulletins, parts..."
          placeholderTextColor={colors.faint}
          returnKeyType="search"
          autoCorrect={false}
          maxFontSizeMultiplier={layout.maxFontScale}
          style={styles.input}
          accessibilityLabel="Search knowledge"
        />
        {query.length > 0 && (
          <Pressable
            onPress={() => onQuery('')}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <X size={layout.iconSize} color={colors.faint} strokeWidth={1.8} />
          </Pressable>
        )}
      </View>
      <Pressable onPress={onCancel} style={styles.cancel} accessibilityRole="button">
        <Text variant="bodyMedium" color="primaryStrong">
          Cancel
        </Text>
      </Pressable>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  bar: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  field: {
    flex: 1,
    height: layout.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.tight,
    paddingHorizontal: spacing.md,
    borderWidth: borders.control,
    borderColor: c.primary,
    borderRadius: radii.card,
    backgroundColor: c.card,
  },
  input: { ...typeScale.body, flex: 1, color: c.ink, paddingVertical: 0 },
  cancel: { height: layout.minTapTarget, justifyContent: 'center', paddingHorizontal: spacing.xxs },
}));
