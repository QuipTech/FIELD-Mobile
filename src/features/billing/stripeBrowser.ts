import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { env } from '@/lib/env';

/**
 * The app never talks to Stripe: the FIELD API returns Stripe page URLs and the app opens them in
 * an in-app browser session (ASWebAuthenticationSession on iOS, Custom Tabs on Android), never a
 * WebView or the external browser. Resolves when the user is back in the app, however the page
 * ended. That says nothing about payment: only the API's invoice status does.
 */
export async function openStripePage(url: string): Promise<void> {
  // Requests sent with RETURN_TO_APP make Stripe return through the portal's /app-return/billing
  // page, which opens this link and so closes the browser. Hosted invoice pages never return;
  // those sessions end when the user closes them.
  await WebBrowser.openAuthSessionAsync(url, APP_RETURN_URL);
}

/** The deep link the portal hands back to (src/app/billing-return.tsx). */
export const APP_RETURN_URL = `${env.scheme}://billing-return`;

/** Sent to `/payment` and `/portal-session` so Stripe returns to the app, not the website. */
export const RETURN_TO_APP = { returnTo: 'app' } as const;

/** Invoice PDFs: a short-lived signed URL, shown in the in-app browser. */
export async function openDocument(url: string): Promise<void> {
  await WebBrowser.openBrowserAsync(url);
}

/** Whether this platform takes the personal fee in the app or on the web portal (see app.config). */
export function personalCheckoutMode(): 'in-app' | 'web' {
  return Platform.OS === 'android' ? env.personalCheckout.android : env.personalCheckout.ios;
}

/** Where 'web' mode sends technicians to pay. */
export const WEB_BILLING_URL = `${env.webUrl}/settings/billing`;
