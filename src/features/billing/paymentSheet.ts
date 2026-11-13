import { TurboModuleRegistry } from 'react-native';
import { z } from 'zod';

import { env } from '@/lib/env';

/**
 * What the API sends so the app can take a payment in Stripe's native Payment Sheet: a
 * PaymentIntent client secret, plus the publishable key of the Stripe account it was made on.
 * The customer and ephemeral key are optional; with them the sheet offers saved cards.
 */
export const paymentSheetParams = z.object({
  publishableKey: z.string().min(1),
  paymentIntentClientSecret: z.string().min(1),
  customerId: z.string().nullish(),
  customerEphemeralKeySecret: z.string().nullish(),
  merchantDisplayName: z.string().nullish(),
});
export type PaymentSheetParams = z.infer<typeof paymentSheetParams>;

/** How the sheet ended. Payment is only ever confirmed by the API, never by this result. */
export type PaymentSheetOutcome = 'paid' | 'cancelled';

/** Thrown when Stripe couldn't set up or take the payment; `message` is safe to show. */
export class PaymentSheetFailedError extends Error {
  constructor(message: string) {
    super(message || 'The payment didn’t go through. Please try again.');
    this.name = 'PaymentSheetFailedError';
  }
}

/** Where 3-D Secure and bank redirects come back to (src/app/stripe-redirect.tsx). */
const STRIPE_RETURN_URL = `${env.scheme}://stripe-redirect`;

type StripeSdk = typeof import('@stripe/stripe-react-native');

/**
 * The Stripe SDK, loaded only when a payment starts. Importing it at the top would crash the
 * whole app in any binary built without its native module (older builds that get an OTA update,
 * Expo Go); this way those builds just fall back to the hosted Stripe page. null: not available.
 */
function loadStripe(): StripeSdk | null {
  if (!TurboModuleRegistry.get('StripeSdk')) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@stripe/stripe-react-native') as StripeSdk;
  } catch {
    return null;
  }
}

/** Whether this binary includes the native Payment Sheet. */
export function paymentSheetAvailable(): boolean {
  return loadStripe() !== null;
}

/**
 * Opens Stripe's native Payment Sheet for one PaymentIntent. Resolves 'paid' when Stripe reports
 * the payment done (or processing), 'cancelled' when the user closed the sheet; throws
 * `PaymentSheetFailedError` otherwise. Check `paymentSheetAvailable()` first.
 */
export async function payWithPaymentSheet(
  params: PaymentSheetParams,
): Promise<PaymentSheetOutcome> {
  const stripe = loadStripe();
  if (!stripe) throw new PaymentSheetFailedError('Payments need the latest version of the app.');
  const { initStripe, initPaymentSheet, presentPaymentSheet, PaymentSheetError } = stripe;
  await initStripe({ publishableKey: params.publishableKey, urlScheme: env.scheme });

  const customer =
    params.customerId && params.customerEphemeralKeySecret
      ? {
          customerId: params.customerId,
          customerEphemeralKeySecret: params.customerEphemeralKeySecret,
        }
      : {};
  const init = await initPaymentSheet({
    merchantDisplayName: params.merchantDisplayName || 'FIELD',
    paymentIntentClientSecret: params.paymentIntentClientSecret,
    returnURL: STRIPE_RETURN_URL,
    // Card only for now: delayed methods (bank debits) would leave the machine blocked for days.
    allowsDelayedPaymentMethods: false,
    ...customer,
  });
  if (init.error)
    throw new PaymentSheetFailedError(init.error.localizedMessage ?? init.error.message);

  const { error } = await presentPaymentSheet();
  if (!error) return 'paid';
  if (error.code === PaymentSheetError.Canceled) return 'cancelled';
  throw new PaymentSheetFailedError(error.localizedMessage ?? error.message);
}
