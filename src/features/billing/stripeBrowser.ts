import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { env } from '@/lib/env';
import { errorMessage } from '@/lib/http';

/** Stripe pages the API may send the app to: Checkout, hosted invoices, the Customer Portal. */
const STRIPE_PAGE_HOSTS = ['checkout.stripe.com', 'invoice.stripe.com', 'billing.stripe.com'];

/** Thrown instead of opening a link that isn't https on a Stripe host. */
export class UnverifiedLinkError extends Error {
  constructor() {
    super('The payment link could not be verified. Please contact support.');
    this.name = 'UnverifiedLinkError';
  }
}

/** The link, if it is https on an allowed host; otherwise throws `UnverifiedLinkError`. */
function verified(url: string, allowed: (host: string) => boolean): string {
  const host = /^https:\/\/([^/?#:@]+)(?::\d+)?(?:[/?#]|$)/i.exec(url)?.[1]?.toLowerCase();
  if (!host || !allowed(host)) throw new UnverifiedLinkError();
  return url;
}

/** How the user came back, from Stripe's return link; null when they just closed the browser. */
export type StripeReturn = 'complete' | 'cancelled' | null;

/**
 * The app never talks to Stripe: the FIELD API returns Stripe page URLs and the app opens them in
 * an in-app browser session (ASWebAuthenticationSession on iOS, Custom Tabs on Android), never a
 * WebView or the external browser. Resolves when the user is back in the app, however the page
 * ended. The result is only for messages: payment is confirmed by the API, never by a link.
 */
export async function openStripePage(url: string): Promise<StripeReturn> {
  // Requests sent with RETURN_TO_APP make Stripe return through the portal's /app-return/billing
  // page, which opens APP_RETURN_URL and so closes the browser. Hosted invoice pages never
  // return; those sessions end when the user closes them.
  const result = await WebBrowser.openAuthSessionAsync(
    verified(url, (host) => STRIPE_PAGE_HOSTS.includes(host)),
    APP_RETURN_URL,
  );
  if (result.type !== 'success') return null;
  const payment = /[?&]payment=(complete|cancelled)\b/.exec(result.url)?.[1];
  return (payment as StripeReturn | undefined) ?? null;
}

/** The deep link the portal hands back to (src/app/billing-return.tsx). */
export const APP_RETURN_URL = `${env.scheme}://billing-return`;

/** Sent to `/payment` and `/portal-session` so Stripe returns to the app, not the website. */
export const RETURN_TO_APP = { returnTo: 'app' } as const;

/** Invoice PDFs: a short-lived signed Stripe URL, shown in the in-app browser. */
export async function openDocument(url: string): Promise<void> {
  await WebBrowser.openBrowserAsync(
    verified(url, (host) => host === 'stripe.com' || host.endsWith('.stripe.com')),
  );
}

/** `errorMessage`, plus the reason a Stripe link was refused. */
export function billingErrorMessage(error: unknown): string {
  return error instanceof UnverifiedLinkError ? error.message : errorMessage(error);
}

/** Whether this platform takes the personal fee in the app or on the web portal (see app.config). */
export function personalCheckoutMode(): 'in-app' | 'web' {
  return Platform.OS === 'android' ? env.personalCheckout.android : env.personalCheckout.ios;
}

/** Where 'web' mode sends technicians to pay. */
export const WEB_BILLING_URL = `${env.webUrl}/settings/billing`;
