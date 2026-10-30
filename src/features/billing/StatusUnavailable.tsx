import { CloudOff } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { popupStyles as styles } from './popupStyles';

/**
 * The Payment required popup's other face: the API answered with an error, so whether payment
 * is due isn't known. Like the portal, it blocks until a retry succeeds (or the user signs out).
 */
export function StatusUnavailable({
  message,
  retrying,
  onRetry,
  onSignOut,
}: {
  message: string;
  retrying: boolean;
  onRetry: () => void;
  onSignOut: () => void;
}) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.center}>
        <View style={[styles.card, styles.content]} accessibilityViewIsModal>
          <View style={styles.badge}>
            <CloudOff size={30} color={colors.brandDeep} strokeWidth={2} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Subscription status unavailable
          </Text>
          <Text color="inkMuted" style={styles.lead} accessibilityRole="alert">
            {message}
          </Text>
          <View style={styles.actions}>
            <BrandButton label="Try again" onPress={onRetry} loading={retrying} />
          </View>
          <Pressable
            onPress={onSignOut}
            accessibilityRole="button"
            hitSlop={8}
            style={({ pressed }) => pressed && { opacity: 0.5 }}
          >
            <Text variant="caption" color="inkMuted" style={styles.signOut}>
              Sign out
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
