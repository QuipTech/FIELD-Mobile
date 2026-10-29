import { useFocusEffect } from 'expo-router';
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { AppState } from 'react-native';

import { http } from '@/lib/http';
import type { BillingAddress } from './address';
import { openDocument, openStripePage } from './stripeBrowser';
import {
  billingKeys,
  paymentResponse,
  personalInvoices,
  personalStatus,
  urlResponse,
  type InvoiceItem,
} from './types';

/** A technician's own monthly fee (`/me/billing`). Owners are exempt; org seats are covered. */

export function usePersonalBilling() {
  return useQuery({
    queryKey: billingKeys.personal,
    // Always re-read on focus: payment can land while the user is in the browser.
    staleTime: 0,
    queryFn: async () => personalStatus.parse(await http.get('/me/billing')),
  });
}

export function usePersonalInvoices(enabled: boolean) {
  return useQuery({
    queryKey: billingKeys.personalInvoices,
    enabled,
    staleTime: 0,
    queryFn: async () => personalInvoices.parse(await http.get('/me/billing/invoices')),
  });
}

/**
 * Asks the API to check Stripe directly (it records a payment whose webhook hasn't arrived), then
 * re-reads the status and invoices. Run whenever the user may have just paid.
 */
export async function confirmPayment(client: QueryClient): Promise<void> {
  try {
    await http.post('/me/billing/payment/check');
  } catch {
    // The fresh read below still shows the best-known status.
  }
  await client.invalidateQueries({ queryKey: billingKeys.personal });
}

/**
 * Pay now: saves the address (for GST), opens the Stripe invoice and, when the browser closes for
 * any reason, confirms with the API. Safe to call again after a failure: the API reuses the
 * month's invoice and never charges twice.
 */
export function usePayNow() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (address: BillingAddress) => {
      const res = paymentResponse.parse(await http.post('/me/billing/payment', address));
      try {
        if (res.paymentUrl) await openStripePage(res.paymentUrl);
      } finally {
        await confirmPayment(client);
      }
    },
  });
}

/** While the screen is open, confirm again whenever the app returns to the foreground. */
export function useConfirmOnForeground(enabled: boolean) {
  const client = useQueryClient();
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') void confirmPayment(client);
      });
      return () => sub.remove();
    }, [enabled, client]),
  );
}

type Scope = 'personal' | 'organisation';
const BASE: Record<Scope, string> = {
  personal: '/me/billing',
  organisation: '/organisation/billing',
};

/** Fetches the invoice's signed PDF URL and opens it. */
export function useOpenInvoicePdf(scope: Scope) {
  return useMutation({
    mutationFn: async (invoice: InvoiceItem) => {
      const path = `${BASE[scope]}/invoices/${encodeURIComponent(invoice.id)}/pdf`;
      await openDocument(urlResponse.parse(await http.get(path)).url);
    },
  });
}

/**
 * Stripe Customer Portal (card, direct debit). The URL is single-use, so it's fetched on every
 * tap and opened straight away; the screen refreshes when the user comes back.
 */
export function useBillingPortal(scope: Scope) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await openStripePage(urlResponse.parse(await http.post(`${BASE[scope]}/portal-session`)).url);
    },
    onSettled: () => client.invalidateQueries({ queryKey: billingKeys.all }),
  });
}
