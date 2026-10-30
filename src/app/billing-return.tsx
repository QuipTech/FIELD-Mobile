import { router } from 'expo-router';
import { useEffect } from 'react';

/**
 * Where Stripe's return link lands (`quiptechfield://billing-return`, via the portal's
 * /app-return/billing page). iOS hands it to the in-app browser session, so this never shows
 * there; Android also opens it as a deep link, so step straight back to wherever the user was.
 * The browser closing triggers the payment check; nothing here confirms payment.
 */
export default function BillingReturnRoute() {
  useEffect(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);
  return null;
}
