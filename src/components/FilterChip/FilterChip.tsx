import { Check, ChevronDown, X, type LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';
import { Text } from '../Text/Text';
import { styles } from './styles';

export type FilterChipProps = {
  label: string;
  selected?: boolean;
  /** Adds a chevron: the chip opens a list of options. */
  dropdown?: boolean;
  /** Adds an ×: pressing the chip clears this filter. */
  removable?: boolean;
  icon?: LucideIcon;
  onPress: () => void;
  accessibilityLabel?: string;
};

/** Compact filter toggle, e.g. "Repairs" or "Open ▾". */
export function FilterChip(props: FilterChipProps) {
  const { label, selected, dropdown, removable, icon: Icon, onPress } = props;
  const color = selected ? colors.brand : colors.inkMuted;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.chip, selected && styles.chipOn, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityState={{ selected: !!selected }}
      accessibilityLabel={props.accessibilityLabel ?? label}
    >
      {Icon && <Icon size={14} color={color} strokeWidth={2} />}
      <Text variant="caption" style={[styles.chipLabel, { color }]}>
        {label}
      </Text>
      {dropdown && <ChevronDown size={14} color={color} strokeWidth={2} />}
      {removable && <X size={14} color={color} strokeWidth={2} />}
    </Pressable>
  );
}

export type FilterOption<T extends string> = { value: T; label: string };

export type FilterSelectProps<T extends string> = {
  /** Sheet title and accessibility name, e.g. "Status". */
  title: string;
  value: T;
  options: FilterOption<T>[];
  onChange: (value: T) => void;
  /** The "no filter" value; the chip is highlighted whenever another value is chosen. */
  allValue?: T;
  /** Chip label while `allValue` is chosen, e.g. "Make" or "Filter". */
  placeholder?: string;
  icon?: LucideIcon;
};

/** Dropdown chip that picks one option from a bottom sheet. */
export function FilterSelect<T extends string>(props: FilterSelectProps<T>) {
  const { title, value, options, onChange, allValue, placeholder, icon } = props;
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const current = options.find((o) => o.value === value)?.label ?? title;
  const showPlaceholder = placeholder !== undefined && value === allValue;

  return (
    <>
      <FilterChip
        label={showPlaceholder ? placeholder : current}
        selected={value !== allValue}
        icon={icon}
        dropdown={!icon}
        onPress={() => setOpen(true)}
        accessibilityLabel={`${title}: ${current}`}
      />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={styles.scrim}
          onPress={() => setOpen(false)}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View
          style={[styles.sheet, { paddingBottom: insets.bottom + 12 }]}
          accessibilityViewIsModal
        >
          <Text style={styles.sheetTitle} accessibilityRole="header">
            {title}
          </Text>
          {options.map((o) => {
            const checked = o.value === value;
            return (
              <Pressable
                key={o.value}
                onPress={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}
                accessibilityRole="radio"
                accessibilityState={{ checked }}
              >
                <Text color={checked ? 'brand' : 'ink'}>{o.label}</Text>
                {checked && <Check size={18} color={colors.brand} strokeWidth={2.5} />}
              </Pressable>
            );
          })}
        </View>
      </Modal>
    </>
  );
}
