import type { LucideIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { ModalSheet } from '../ModalSheet/ModalSheet';
import { Text } from '../Text/Text';
import { makeStyles, useTheme } from '@/theme';

export type SheetAction = {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  destructive?: boolean;
};

/** A list of actions in a bottom sheet (long press on a result, the reader's ⋯ menu). */
export function ActionSheet(props: {
  visible: boolean;
  title: string;
  actions: SheetAction[];
  onClose: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <ModalSheet visible={props.visible} title={props.title} onClose={props.onClose}>
      {props.actions.map((a) => {
        const Icon = a.icon;
        return (
          <Pressable
            key={a.label}
            onPress={() => {
              props.onClose();
              a.onPress();
            }}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Icon size={20} color={a.destructive ? colors.danger : colors.ink} strokeWidth={2} />
            <Text color={a.destructive ? 'danger' : 'ink'}>{a.label}</Text>
          </Pressable>
        );
      })}
    </ModalSheet>
  );
}

const useStyles = makeStyles(() => ({
  row: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 4 },
  pressed: { opacity: 0.6 },
}));
