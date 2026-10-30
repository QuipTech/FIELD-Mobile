import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { Text } from '@/components/Text/Text';
import { styles } from '@/features/me/styles';
import { formatCents } from './format';
import { PersonalSection, type PersonalSectionProps } from './PersonalSection';
import { billingStyles } from './styles';

export type PaymentRequiredProps = PersonalSectionProps & { onSignOut: () => void };

/**
 * Shown over Home while the user's own monthly fee is unpaid: they can pay here or sign out.
 * It closes itself once the API says the month is paid.
 */
export function PaymentRequired({ onSignOut, ...personal }: PaymentRequiredProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[billingStyles.gate, { paddingTop: insets.top }]}>
      <DetailScreen>
        <View style={billingStyles.gateIntro}>
          <Text style={styles.planTitle} accessibilityRole="header">
            Payment required
          </Text>
          <Text color="inkMuted">
            Your FIELD account needs this month&apos;s fee of{' '}
            {formatCents(personal.status.monthlyCents)} (ex GST) before you can keep using the app.
          </Text>
        </View>
        <PersonalSection {...personal} />
        <BrandButton label="Sign out" variant="outline" onPress={onSignOut} />
      </DetailScreen>
    </View>
  );
}
