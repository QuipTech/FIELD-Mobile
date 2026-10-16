import { WifiOff } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useIsOffline } from '@/lib/network';
import { colors } from '@/theme';
import { Text } from '../Text/Text';
import { styles } from './styles';

export type OfflineBannerProps = {
  /** Number of queued writes; shown once the outbox exists (Step 5). */
  pendingCount?: number;
};

/** Persistent banner at the very top while the device is offline. */
export function OfflineBanner({ pendingCount = 0 }: OfflineBannerProps) {
  const offline = useIsOffline();
  const insets = useSafeAreaInsets();
  if (!offline) return null;

  const pending =
    pendingCount > 0 ? ` ${pendingCount} change${pendingCount === 1 ? '' : 's'} pending sync.` : '';
  const message = `Offline — showing saved data.${pending}`;

  return (
    <View
      style={[styles.banner, { paddingTop: insets.top + 8 }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}
    >
      <WifiOff size={16} color={colors.onInk} strokeWidth={2} />
      <Text variant="label" color="onInk" style={styles.text}>
        {message}
      </Text>
    </View>
  );
}
