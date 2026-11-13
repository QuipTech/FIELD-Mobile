import { router } from 'expo-router';
import { useEffect } from 'react';

/**
 * Where Stripe's Payment Sheet returns after 3-D Secure or a bank redirect
 * (`quiptechfield://stripe-redirect`). The sheet itself handles the result; this route only
 * steps back so the user stays on the screen that opened the sheet.
 */
export default function StripeRedirectRoute() {
  useEffect(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);
  return null;
}
