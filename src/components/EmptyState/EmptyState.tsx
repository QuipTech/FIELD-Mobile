import { Inbox, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { useTheme } from '@/theme';
import { Button } from '../Button/Button';
import { Text } from '../Text/Text';
import { useStateStyles } from './styles';

export type StateAction = { label: string; onPress: () => void; loading?: boolean };

export type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: LucideIcon;
  /** Danger-tinted tile (errors). */
  tone?: 'neutral' | 'danger';
  /** Filled button, e.g. "Go to Knowledge". */
  primaryAction?: StateAction;
  /** Outline button, e.g. "Clear 2 filters". */
  action?: StateAction;
  testID?: string;
};

/** Empty / no-results state (K4b, K7b): tile, 20 px title, muted message, up to two buttons. */
export function EmptyState(props: EmptyStateProps) {
  const { title, message, icon: Icon = Inbox, tone = 'neutral', primaryAction, action } = props;
  const styles = useStateStyles();
  const { colors } = useTheme();
  const danger = tone === 'danger';
  return (
    <View style={styles.container} accessibilityRole="summary" testID={props.testID}>
      <View style={[styles.tile, danger && styles.dangerTile]}>
        <Icon size={26} color={danger ? colors.danger : colors.muted} strokeWidth={1.8} />
      </View>
      <View style={styles.text}>
        <Text variant="sheetTitle" accessibilityRole="header">
          {title}
        </Text>
        {message && <Text color="muted">{message}</Text>}
      </View>
      {(primaryAction || action) && (
        <View style={styles.actions}>
          {primaryAction && <Button {...primaryAction} />}
          {action && <Button {...action} variant="secondary" />}
        </View>
      )}
    </View>
  );
}
