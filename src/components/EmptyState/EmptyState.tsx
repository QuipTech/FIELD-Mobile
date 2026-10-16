import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { colors } from '@/theme';
import { Button } from '../Button/Button';
import { Text } from '../Text/Text';
import { styles } from './styles';

export type StateAction = { label: string; onPress: () => void };

export type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: LucideIcon;
  action?: StateAction;
};

/** Flush-left empty state for lists and screens with no data. */
export function EmptyState({ title, message, icon: Icon, action }: EmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="summary">
      {Icon ? <Icon size={28} color={colors.ink} strokeWidth={2} /> : <View style={styles.rule} />}
      <Text variant="heading">{title}</Text>
      {message && <Text color="inkMuted">{message}</Text>}
      {action && (
        <Button
          label={action.label}
          onPress={action.onPress}
          variant="secondary"
          style={styles.action}
        />
      )}
    </View>
  );
}
