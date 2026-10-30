import { router, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

import { usePersonalBilling } from './personalApi';

/**
 * Home calls this: while the user's own monthly fee is unpaid, it opens the Payment required
 * screen, every time Home comes back into view. Owners (exempt) and members on an organisation
 * seat (covered) never see it, and nothing opens until the API has answered.
 */
export function usePaymentGate(enabled: boolean) {
  const { data } = usePersonalBilling();
  const due = enabled && !!data?.paymentRequired;
  useFocusEffect(
    useCallback(() => {
      if (due) router.push('/payment-required');
    }, [due]),
  );
}
