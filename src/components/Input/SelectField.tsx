import { ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { layout, useTheme } from '@/theme';
import { ChoiceSheet } from '../FilterChip/FilterChip';
import { Text } from '../Text/Text';
import { useStyles } from './styles';

export type SelectOption = { value: string; label: string };

export type SelectFieldProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  /** Shown while nothing is chosen, e.g. "Choose a make". */
  placeholder: string;
  disabled?: boolean;
  hint?: string;
};

/**
 * A form dropdown that looks like `Input`: label above, field with a chevron, options in a
 * `ChoiceSheet` (a native Modal, so it opens above pushed screens such as Add machine).
 */
export function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  hint,
}: SelectFieldProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value)?.label;
  return (
    <View style={styles.wrapper}>
      <Text variant="label" color="muted">
        {label}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${current ?? placeholder}`}
        accessibilityState={{ disabled: !!disabled }}
        style={[styles.field, disabled && styles.disabled]}
      >
        <Text
          numberOfLines={1}
          color={current ? 'ink' : 'faint'}
          style={styles.selectText}
          maxFontSizeMultiplier={layout.maxFontScale}
        >
          {current ?? placeholder}
        </Text>
        <ChevronDown size={20} color={colors.faint} strokeWidth={2} />
      </Pressable>
      {hint ? (
        <Text variant="caption" color="muted">
          {hint}
        </Text>
      ) : null}
      <ChoiceSheet
        visible={open}
        title={label}
        options={options}
        value={value || undefined}
        onChange={onChange}
        onClose={() => setOpen(false)}
      />
    </View>
  );
}
