import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { http } from '@/lib/http';
import { annualQuote, billingKeys, organisationInvoices, organisationSummary } from './types';

/**
 * The organisation's plan and invoices (`billing.manage`: Owner, Organisation Admin; 403
 * otherwise). Cards saved in the Stripe portal pay invoices automatically: the app never
 * triggers an organisation payment.
 */

export function useOrganisationBilling(enabled: boolean) {
  return useQuery({
    queryKey: billingKeys.organisation,
    enabled,
    staleTime: 0,
    queryFn: async () => organisationSummary.parse(await http.get('/organisation/billing')),
  });
}

export function useOrganisationInvoices(enabled: boolean) {
  return useQuery({
    queryKey: billingKeys.organisationInvoices,
    enabled,
    staleTime: 0,
    queryFn: async () =>
      organisationInvoices.parse(await http.get('/organisation/billing/invoices')),
  });
}

/** Annual prepaid price for committing to `qty` machines; null skips the request. */
export function useAnnualQuote(qty: number | null) {
  return useQuery({
    queryKey: billingKeys.annualQuote(qty ?? 0),
    enabled: qty !== null,
    queryFn: async () =>
      annualQuote.parse(
        await http.get('/organisation/billing/annual-quote', { query: { committedQty: qty! } }),
      ),
  });
}

export type NextTerm = { term: 'monthly' } | { term: 'annual'; committedQty: number };

/** Plan changes all take effect at the next renewal; each refreshes the summary. */
export function usePlanChanges() {
  const client = useQueryClient();
  const refresh = () => client.invalidateQueries({ queryKey: billingKeys.organisation });
  return {
    nextTerm: useMutation({
      mutationFn: (choice: NextTerm) => http.put('/organisation/billing/next-term', choice),
      onSuccess: refresh,
    }),
    cancel: useMutation({
      mutationFn: (reason: string) => http.post('/organisation/billing/cancel', { reason }),
      onSuccess: refresh,
    }),
    keep: useMutation({
      mutationFn: () => http.delete('/organisation/billing/cancel'),
      onSuccess: refresh,
    }),
  };
}
