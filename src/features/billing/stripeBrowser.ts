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
  // Stripe returns to the web portal today, so this redirect only matters once the API accepts
  // an app return URL; until then the session ends when the user closes it.
  await WebBrowser.openAuthSessionAsync(url, `${env.scheme}://billing`);
}

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
