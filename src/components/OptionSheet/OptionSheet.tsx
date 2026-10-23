import { Check } from 'lucide-react-native';

import { useTheme } from '@/theme';
import { Card } from '../Card/Card';
import { ListRow } from '../ListRow/ListRow';
import { Sheet } from '../Sheet/Sheet';

export type PickerOption<T extends string> = { value: T | undefined; label: string };

/** Picker for a dropdown chip (Brand, Type, Model, snapshot…): a sheet with one row per option. */
export function OptionSheet<T extends string>({
  title,
  options,
  value,
  onChange,
  onClose,
}: {
  title: string | undefined;
  options: PickerOption<T>[];
  value: T | undefined;
  onChange: (value: T | undefined) => void;
  onClose: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Sheet visible={!!title} onClose={onClose} title={title ?? ''}>
      <Card padded={false} style={{ overflow: 'hidden' }}>
        {options.map((o, i) => (
          <ListRow
            key={o.label}
            title={o.label}
            last={i === options.length - 1}
            trailing={
              o.value === value ? (
                <Check size={20} color={colors.primary} strokeWidth={2} />
              ) : undefined
            }
            accessibilityLabel={`${o.label}${o.value === value ? ', selected' : ''}`}
            onPress={() => {
              onChange(o.value);
              onClose();
            }}
          />
        ))}
      </Card>
    </Sheet>
  );
}
