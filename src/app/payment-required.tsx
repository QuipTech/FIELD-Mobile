import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler } from 'react-native';

import { signOutUser } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { PaymentRequired } from '@/features/billing/PaymentRequired';
import {
  useConfirmOnForeground,
  usePayNow,
  usePersonalBilling,
} from '@/features/billing/personalApi';
import { personalCheckoutMode, WEB_BILLING_URL } from '@/features/billing/stripeBrowser';
import { errorMessage } from '@/lib/http';

/** Opened by Home while the user's own fee is unpaid (see usePaymentGate). */
export default function PaymentRequiredRoute() {
  const personal = usePersonalBilling();
  const payNow = usePayNow();
  const paid = !!personal.data && !personal.data.paymentRequired;
  useConfirmOnForeground(!paid);

  useFocusEffect(
    useCallback(() => {
      // Only the API's status closes this screen; Android's back button can't skip it.
      if (paid) {
        if (router.canGoBack()) router.back();
        return;
      }
      const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
      return () => sub.remove();
    }, [paid]),
  );

  if (!personal.data) return null;
  return (
    <PaymentRequired
      status={personal.data}
      checkout={personalCheckoutMode()}
      webBillingUrl={WEB_BILLING_URL}
      paying={payNow.isPending}
      payError={payNow.error ? errorMessage(payNow.error) : undefined}
      onPay={(address) => payNow.mutate(address)}
      onSignOut={() => runAuth(signOutUser)}
    />
  );
}
