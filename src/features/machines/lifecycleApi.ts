import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { paymentSheetParams, type PaymentSheetParams } from '@/features/billing/paymentSheet';
import { http } from '@/lib/http';
import { machineKeys } from './api';

/** Machine lifecycle (activate / deactivate / archive / sell) and its billing impact. */

const enc = encodeURIComponent;

export const LIFECYCLE_STATES = ['registered', 'active', 'archived', 'sold'] as const;
export type LifecycleState = (typeof LIFECYCLE_STATES)[number];
export type LifecycleAction = 'activate' | 'deactivate' | 'archive' | 'reactivate' | 'sell';

const lifecycleEvent = z.object({
  id: z.string(),
  fromState: z.string().nullish(),
  toState: z.string(),
  reason: z.string().nullish(),
  occurredAt: z.string(),
  actorName: z.string().nullish(),
  transferId: z.string().nullish(),
});
export type LifecycleEvent = z.infer<typeof lifecycleEvent>;

const lifecycle = z.object({
  machineId: z.string(),
  lifecycleState: z.string(),
  availableActions: z.array(z.string()).default([]),
  canRequestTransfer: z.boolean().default(false),
  events: z.array(lifecycleEvent).default([]),
});
export type MachineLifecycleInfo = Omit<z.infer<typeof lifecycle>, 'availableActions'> & {
  availableActions: LifecycleAction[];
};

const band = z.object({ from: z.number(), to: z.number().nullable(), unitCents: z.number() });
const activationQuote = z.discriminatedUnion('pricing', [
  z.object({ pricing: z.literal('contract'), timezone: z.string(), invoicedOn: z.string() }),
  z.object({
    pricing: z.literal('per_machine'),
    term: z.enum(['monthly', 'annual']),
    committedQty: z.number().nullable(),
    timezone: z.string(),
    invoicedOn: z.string(),
    activeToday: z.number(),
    machinesAfter: z.number(),
    billableBefore: z.number(),
    billableAfter: z.number(),
    rateBeforeCents: z.number().nullable(),
    rateAfterCents: z.number(),
    monthlyBeforeCents: z.number(),
    monthlyAfterCents: z.number(),
    bands: z.array(band).default([]),
  }),
]);
export type ActivationQuote = z.infer<typeof activationQuote>;

export type LifecycleChangeResult = {
  machineId: string;
  action: LifecycleAction;
  fromState: LifecycleState;
  lifecycleState: LifecycleState;
  countedFrom: string | null;
  billedUntilExclusive: string | null;
  enterpriseReviewRaised: boolean;
};

const KNOWN_ACTIONS: readonly string[] = [
  'activate',
  'deactivate',
  'archive',
  'reactivate',
  'sell',
];

export const lifecycleKeys = {
  one: (id: string) => ['machines', id, 'lifecycle'] as const,
  quote: ['machines', 'activation-quote'] as const,
  deletion: (id: string) => ['machines', id, 'deletion-check'] as const,
};

/** State, the actions this user may take (empty without `machine.lifecycle`) and the timeline. */
export function useLifecycle(id: string | undefined) {
  return useQuery({
    queryKey: lifecycleKeys.one(id ?? ''),
    enabled: !!id,
    staleTime: 0,
    queryFn: async (): Promise<MachineLifecycleInfo> => {
      const res = lifecycle.parse(await http.get(`/machines/${enc(id!)}/lifecycle`));
      return {
        ...res,
        availableActions: res.availableActions.filter((a): a is LifecycleAction =>
          KNOWN_ACTIONS.includes(a),
        ),
      };
    },
  });
}

/** What activating one more machine does to the bill; nothing is charged. */
export function useActivationQuote(enabled: boolean) {
  return useQuery({
    queryKey: lifecycleKeys.quote,
    enabled,
    staleTime: 0,
    gcTime: 0,
    queryFn: async () =>
      activationQuote.parse(
        await http.get('/machines/lifecycle/activation-quote', { query: { count: 1 } }),
      ),
  });
}

/** Runs a lifecycle action, then reloads the lifecycle, the machine and the fleet. */
export function useLifecycleAction(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ action, reason }: { action: LifecycleAction; reason?: string }) =>
      http.post<LifecycleChangeResult>(
        `/machines/${enc(id)}/lifecycle`,
        { action, ...(reason?.trim() && { reason: reason.trim() }) },
        { retry: false },
      ),
    // 409 means the state moved under us: reloading shows the real state either way.
    onSettled: () => client.invalidateQueries({ queryKey: machineKeys.all }),
  });
}

// ── Deletion ─────────────────────────────────────────────────────────────

export type DeletionBlocker =
  | 'needs_deactivation'
  | 'sold'
  | 'open_cases'
  | 'pending_transfer'
  | 'awaiting_final_invoice'
  | 'unpaid_invoices'
  | 'final_charge_due';

const finalChargeMonth = z.object({
  periodStart: z.string(),
  lastUsedOn: z.string(),
  daysUsed: z.number(),
  daysInMonth: z.number(),
  monthlyRateCents: z.number(),
  amountCents: z.number(),
});
const deletionCheck = z.object({
  canDelete: z.boolean(),
  blocker: z.string().nullable(),
  message: z.string().nullable(),
  finalInvoiceFrom: z.string().nullable().default(null),
  unpaidInvoices: z
    .array(
      z.object({
        id: z.string(),
        periodStart: z.string().nullish(),
        status: z.string(),
        hostedInvoiceUrl: z.string().nullable(),
        isFinalCharge: z.boolean().default(false),
      }),
    )
    .default([]),
  finalCharge: z
    .object({ amountCents: z.number(), months: z.array(finalChargeMonth).default([]) })
    .nullable()
    .default(null),
});
export type DeletionCheck = Omit<z.infer<typeof deletionCheck>, 'blocker'> & {
  blocker: DeletionBlocker | null;
};
/**
 * How to pay the final charge: `paymentSheet` (native Stripe sheet) when the API sends a
 * PaymentIntent, else `paymentUrl` (hosted Stripe page). Both null: nothing left to pay.
 */
export type FinalChargeResult = DeletionCheck & {
  paymentUrl: string | null;
  paymentSheet: PaymentSheetParams | null;
};

const asCheck = (raw: unknown): DeletionCheck => deletionCheck.parse(raw) as DeletionCheck;

export function useDeletionCheck(id: string) {
  return useQuery({
    queryKey: lifecycleKeys.deletion(id),
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => asCheck(await http.get(`/machines/${enc(id)}/deletion-check`)),
  });
}

/** Raises (or re-finds) the final charge; safe to repeat, so every Pay press calls it again. */
export function usePayFinalCharge(id: string) {
  return useMutation({
    mutationFn: async (): Promise<FinalChargeResult> => {
      const raw = await http.post<Record<string, unknown>>(
        `/machines/${enc(id)}/final-charge`,
        {},
        { retry: false },
      );
      const url = raw?.paymentUrl;
      const sheet = paymentSheetParams.safeParse(raw?.paymentSheet);
      return {
        ...asCheck(raw),
        paymentUrl: typeof url === 'string' && url ? url : null,
        paymentSheet: sheet.success ? sheet.data : null,
      };
    },
  });
}

/** Soft-deletes the machine (204). 409 when something changed since the check. */
export function useDeleteMachine(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (reason: string) =>
      http.request(`/machines/${enc(id)}`, { method: 'DELETE', body: { reason }, retry: false }),
    onSuccess: () => client.invalidateQueries({ queryKey: machineKeys.all }),
  });
}
