import { CircleAlert, RotateCw, WifiOff } from 'lucide-react-native';
import { View } from 'react-native';

import { NetworkError, errorMessage } from '@/lib/http';
import { colors } from '@/theme';
import { Button } from '../Button/Button';
import { Text } from '../Text/Text';
import { styles } from '../EmptyState/styles';

export type ErrorStateProps = {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  retrying?: boolean;
};

/** Error with retry. Shows an offline variant when the cause is connectivity. */
export function ErrorState({ error, title, onRetry, retrying }: ErrorStateProps) {
  const offline = error instanceof NetworkError && !error.isTimeout;
  const Icon = offline ? WifiOff : CircleAlert;
  const heading = title ?? (offline ? "You're offline" : "Couldn't load this");
  const message = offline
    ? "This hasn't been saved for offline use yet. Reconnect and try again."
    : errorMessage(error);

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Icon size={28} color={offline ? colors.ink : colors.accentText} strokeWidth={2} />
      <Text variant="heading">{heading}</Text>
      <Text color="inkMuted">{message}</Text>
      {onRetry && (
        <Button
          label="Try again"
          icon={RotateCw}
          onPress={onRetry}
          loading={retrying}
          variant="secondary"
          style={styles.action}
        />
      )}
    </View>
  );
}
