import { RotateCw, WifiOff } from 'lucide-react-native';
import { View } from 'react-native';

import { layout, useTheme } from '@/theme';
import { Button } from '../Button/Button';
import { useStateStyles } from '../EmptyState/styles';
import { Text } from '../Text/Text';

export type OfflineNoticeProps = {
  /** e.g. "Showing documents saved on this device". */
  message?: string;
  onRetry?: () => void;
};

/** K7c: amber strip above cached content when a refresh failed offline. Retry re-runs the query. */
export function OfflineNotice({
  message = 'Showing data saved on this device',
  onRetry,
}: OfflineNoticeProps) {
  const styles = useStateStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.notice} accessibilityRole="alert">
      <WifiOff size={layout.iconSize} color={colors.warning} strokeWidth={1.8} />
      <View style={styles.noticeText}>
        <Text variant="row" color="warning">
          You&apos;re offline
        </Text>
        <Text variant="caption" color="warning">
          {message}
        </Text>
      </View>
      {onRetry && (
        <Button label="Retry" icon={RotateCw} size="small" variant="secondary" onPress={onRetry} />
      )}
    </View>
  );
}
