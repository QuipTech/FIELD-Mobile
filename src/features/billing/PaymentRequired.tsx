import { CreditCard, Lock } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { colors, springs, useReducedMotion } from '@/theme';
import { AddressForm } from './AddressForm';
import type { BillingAddress } from './address';
import { formatBillingMonth, formatCents } from './format';
import { PAYMENT_TERMS, periodLine } from './PersonalSection';
import { popupStyles as styles } from './popupStyles';
import type { PersonalStatus } from './types';

export type PaymentRequiredProps = {
  status: PersonalStatus;
  checkout: 'in-app' | 'web';
  webBillingUrl: string;
  paying: boolean;
  payError?: string;
  onPay: (address: BillingAddress) => void;
  /** 'web' mode: ask the API again after paying on the portal. */
  checking: boolean;
  onCheckAgain: () => void;
  onSignOut: () => void;
};

/**
 * The popup over Home while the user's own monthly fee is unpaid. There is no close button: it
 * goes away once the API says the month is paid (or the user signs out).
 */
export function PaymentRequired(props: PaymentRequiredProps) {
  const reduced = useReducedMotion();
  const { status } = props;
  return (
    <View style={styles.backdrop}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.center}
      >
        <Animated.View
          entering={reduced ? undefined : ZoomIn.springify().damping(springs.sheet.damping)}
          style={styles.card}
          accessibilityViewIsModal
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.badge}>
              <CreditCard size={30} color={colors.brandDeep} strokeWidth={2} />
            </View>
            <Pill label={`Due · ${formatBillingMonth(status.periodStart)}`} tone="amber" />
            <Text style={styles.title} accessibilityRole="header">
              Your subscription is due
            </Text>
            <Text color="inkMuted" style={styles.lead}>
              Pay this month&apos;s FIELD fee to keep scanning machines, asking AI and logging work.
            </Text>

            <View style={styles.price}>
              <Text style={styles.amount}>{formatCents(status.monthlyCents)}</Text>
              <Text variant="caption" color="inkMuted">
                per month · ex GST
              </Text>
              <Text variant="caption" color="inkMuted" style={styles.centered}>
                {periodLine(status)}
              </Text>
            </View>
            <Text variant="caption" color="inkMuted" style={styles.centered}>
              {PAYMENT_TERMS}
            </Text>

            <PayActions {...props} />

            <View style={styles.secure}>
              <Lock size={14} color={colors.inkMuted} strokeWidth={2} />
              <Text variant="caption" color="inkMuted">
                Card details go to Stripe, never to FIELD.
              </Text>
            </View>
            <Pressable
              onPress={props.onSignOut}
              accessibilityRole="button"
              hitSlop={8}
              style={({ pressed }) => pressed && { opacity: 0.5 }}
            >
              <Text variant="caption" color="inkMuted" style={styles.signOut}>
                Sign out
              </Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

/** Pay now → address → Stripe; or, on the web portal, a re-check button. */
function PayActions({
  checkout,
  webBillingUrl,
  paying,
  payError,
  onPay,
  checking,
  onCheckAgain,
}: PaymentRequiredProps) {
  // Kept after an attempt (cancelled, declined, failed) so paying again is one tap.
  const [address, setAddress] = useState<BillingAddress | null>(null);
  const [lastAddress, setLastAddress] = useState<BillingAddress>();
  const [showForm, setShowForm] = useState(false);

  if (checkout === 'web')
    return (
      <View style={styles.actions}>
        <Text variant="caption" color="inkMuted" style={styles.centered} selectable>
          Pay from Billing on the FIELD website:{'\n'}
          {webBillingUrl}
        </Text>
        <BrandButton label="I've paid, check again" onPress={onCheckAgain} loading={checking} />
      </View>
    );
  if (address)
    return (
      <View style={styles.actions}>
        {payError && (
          <Text
            variant="caption"
            color="danger"
            style={styles.centered}
            accessibilityLiveRegion="polite"
          >
            {payError}
          </Text>
        )}
        <BrandButton
          label={payError ? 'Try again' : 'Pay now'}
          onPress={() => onPay(address)}
          loading={paying}
        />
        <BrandButton
          label="Change address"
          variant="outline"
          onPress={() => setAddress(null)}
          disabled={paying}
        />
      </View>
    );
  if (showForm)
    return (
      <View style={styles.actions}>
        <AddressForm
          busy={paying}
          initial={lastAddress}
          onSubmit={(next) => {
            setAddress(next);
            setLastAddress(next);
            onPay(next);
          }}
        />
      </View>
    );
  return (
    <View style={styles.actions}>
      <BrandButton label="Pay now" onPress={() => setShowForm(true)} />
    </View>
  );
}
