import { Platform, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Text } from '@/components/Text/Text';
import { AppleIcon, GoogleIcon } from './BrandIcons';
import { styles } from './styles';

export type SocialButtonsProps = { onGoogle: () => void; onApple: () => void };

/** Google (+ Apple on iOS) sign-in, followed by the "or with work email" divider. */
export function SocialButtons({ onGoogle, onApple }: SocialButtonsProps) {
  return (
    <>
      <BrandButton
        variant="outline"
        label="Continue with Google"
        icon={<GoogleIcon />}
        onPress={onGoogle}
      />
      {Platform.OS === 'ios' && (
        <BrandButton
          variant="outline"
          label="Continue with Apple"
          icon={<AppleIcon />}
          onPress={onApple}
        />
      )}
      <View style={styles.orRow} accessibilityRole="text">
        <View style={styles.orLine} />
        <Text variant="caption" color="inkMuted">
          or with work email
        </Text>
        <View style={styles.orLine} />
      </View>
    </>
  );
}
