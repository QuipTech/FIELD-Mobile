import { Check } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { FormSheet } from '@/components/FormSheet/FormSheet';
import { Text } from '@/components/Text/Text';
import { makeStyles, useTheme } from '@/theme';
import type { GroupInput, MachineGroup } from './groupsApi';

/** The colours a group can have; they're saved on the group and shown to everyone. */
export const GROUP_COLOURS = [
  '#4F3FF0',
  '#2563EB',
  '#0891B2',
  '#059669',
  '#65A30D',
  '#D97706',
  '#DC2626',
  '#DB2777',
] as const;

/** A group's colour, else the theme's primary. */
export function GroupDot({
  colour,
  size = 12,
}: {
  colour: string | null | undefined;
  size?: number;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colour ?? colors.primary,
      }}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}

function ColourPicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (c: string | null) => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const swatch = (c: string | null, label: string) => {
    const selected = value === c;
    return (
      <Pressable
        key={label}
        onPress={() => onChange(c)}
        style={[styles.swatch, { backgroundColor: c ?? colors.fill }, selected && styles.selected]}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
        accessibilityLabel={label}
      >
        {selected && <Check size={16} color={c ? colors.onButton : colors.ink} strokeWidth={3} />}
        {!c && !selected && (
          <Text variant="caption" color="muted">
            Aa
          </Text>
        )}
      </Pressable>
    );
  };
  return (
    <View style={{ gap: 6 }}>
      <Text variant="label" color="muted">
        Colour
      </Text>
      <View style={styles.swatches}>
        {swatch(null, 'Default colour')}
        {GROUP_COLOURS.map((c) => swatch(c, `Colour ${c}`))}
      </View>
    </View>
  );
}

/** New group, or edit one (`group` set). 409 (name taken) shows in the sheet. */
export function GroupSheet(props: {
  visible: boolean;
  group?: MachineGroup;
  onClose: () => void;
  onSave: (input: GroupInput) => Promise<unknown>;
}) {
  const { group } = props;
  const [colour, setColour] = useState<string | null>(group?.colour ?? null);
  const initial = useMemo(
    () => ({ name: group?.name ?? '', description: group?.description ?? '' }),
    [group],
  );
  return (
    <FormSheet
      visible={props.visible}
      title={group ? 'Edit group' : 'New group'}
      fields={[
        { key: 'name', label: 'Name', required: true, maxLength: 100 },
        { key: 'description', label: 'Description', multiline: true },
      ]}
      initial={initial}
      submitLabel={group ? 'Save' : 'Create group'}
      onClose={props.onClose}
      onSubmit={(v) =>
        props.onSave({ name: v.name!, colour, description: v.description ? v.description : null })
      }
    >
      <ColourPicker value={colour} onChange={setColour} />
    </FormSheet>
  );
}

const useStyles = makeStyles((c) => ({
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: c.border,
  },
  selected: { borderWidth: 3, borderColor: c.ink },
}));
