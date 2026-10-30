import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { ApiError } from '@/lib/http';
import { usePersonalBilling } from './personalApi';

/**
 * The API answered, but with a server error: whether payment is due can't be known, so the app
 * blocks as the portal does. Being offline never blocks: the app is used where there's no signal.
 */
export function isBlockingStatusError(error: unknown): boolean {
  return error instanceof ApiError && error.status >= 500;
}

/**
 * Home calls this: while the user's own monthly fee is unpaid (or its status can't be read), it
 * opens the Payment required popup, every time Home comes back into view. Owners (exempt) and
 * members on an organisation seat (covered) never see it.
 */
export function usePaymentGate(enabled: boolean) {
  const { data, error } = usePersonalBilling();
  const due = enabled && (data ? data.paymentRequired : isBlockingStatusError(error));
  useFocusEffect(
    useCallback(() => {
      if (due) router.push('/payment-required');
    }, [due]),
  );
}
