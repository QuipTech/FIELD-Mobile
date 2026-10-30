import { useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { BackHandler } from 'react-native';

import { signOutUser } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { PaymentRequired } from '@/features/billing/PaymentRequired';
import { StatusUnavailable } from '@/features/billing/StatusUnavailable';
import { isBlockingStatusError } from '@/features/billing/usePaymentGate';
import {
  confirmPayment,
  useConfirmOnForeground,
  usePayNow,
  usePersonalBilling,
} from '@/features/billing/personalApi';
import {
  billingErrorMessage,
  personalCheckoutMode,
  WEB_BILLING_URL,
} from '@/features/billing/stripeBrowser';
import { errorMessage } from '@/lib/http';

/** The Payment required popup, opened by Home while the user's fee is unpaid or unknown (usePaymentGate). */
export default function PaymentRequiredRoute() {
  const personal = usePersonalBilling();
  const payNow = usePayNow();
  const client = useQueryClient();
  const [checking, setChecking] = useState(false);
  const checkAgain = () => {
    setChecking(true);
    confirmPayment(client).finally(() => setChecking(false));
  };
  const { data, error } = personal;
  // Closes once the API says the month is paid, or if the status can't be read for a reason that
  // shouldn't block (offline: see isBlockingStatusError).
  const paid = data ? !data.paymentRequired : !!error && !isBlockingStatusError(error);
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

  const signOut = () => runAuth(signOutUser);
  if (!data) {
    if (!isBlockingStatusError(error)) return null;
    return (
      <StatusUnavailable
        message={errorMessage(error)}
        retrying={personal.isFetching}
        onRetry={() => personal.refetch()}
        onSignOut={signOut}
      />
    );
  }
  return (
    <PaymentRequired
      status={data}
      checkout={personalCheckoutMode()}
      webBillingUrl={WEB_BILLING_URL}
      paying={payNow.isPending}
      payError={payNow.error ? billingErrorMessage(payNow.error) : undefined}
      onPay={(address) => payNow.mutate(address)}
      checking={checking}
      onCheckAgain={checkAgain}
      onSignOut={signOut}
    />
  );
}
