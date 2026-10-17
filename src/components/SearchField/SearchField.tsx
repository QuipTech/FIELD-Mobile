import { Search, X } from 'lucide-react-native';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { brandControl, colors, layout, spacing, typeScale } from '@/theme';

export type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  /** Placeholder and accessibility name, e.g. "Search manuals". */
  label: string;
  style?: StyleProp<ViewStyle>;
};

/** Rounded search box with a clear button (M3, M5.6, M14). */
export function SearchField({ value, onChange, label, style }: SearchFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, focused && styles.focused, style]}>
      <Search size={20} color={colors.inkSubtle} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={label}
        placeholderTextColor={colors.inkSubtle}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        maxFontSizeMultiplier={layout.maxFontScale}
        style={styles.input}
        accessibilityLabel={label}
      />
      {value.length > 0 && (
        <Pressable
          onPress={() => onChange('')}
          style={styles.clear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <X size={18} color={colors.inkSubtle} strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.control,
    borderRadius: brandControl.radius,
    backgroundColor: colors.surface,
    paddingLeft: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  focused: { borderColor: colors.brand },
  input: { ...typeScale.body, flex: 1, color: colors.ink, paddingVertical: spacing.sm },
  clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
