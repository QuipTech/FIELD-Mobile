import { z } from 'zod';

/**
 * Billing API shapes (FIELD-Portal docs/billing/BILLING_API.md). Money is integer AUD cents, ex
 * GST unless a field says otherwise; periods are calendar days with an exclusive end.
 */

export const billingKeys = {
  all: ['billing'] as const,
  personal: ['billing', 'personal'] as const,
  personalInvoices: ['billing', 'personal', 'invoices'] as const,
  organisation: ['billing', 'organisation'] as const,
  organisationInvoices: ['billing', 'organisation', 'invoices'] as const,
  annualQuote: (qty: number) => ['billing', 'organisation', 'annual-quote', qty] as const,
};

const cents = z.number().int();

export const personalStatus = z
  .object({
    exempt: z.boolean(),
    coveredByOrganisation: z.boolean(),
    paymentRequired: z.boolean(),
    monthlyCents: cents,
    timezone: z.string().nullish(),
    periodStart: z.string(),
    periodEnd: z.string(),
    invoiceId: z.string().nullish(),
    invoiceStatus: z.string().nullish(),
    gstCents: cents.nullish(),
    /** Incl. GST; null until Stripe Tax has calculated it. */
    totalCents: cents.nullish(),
  })
  .loose();
export type PersonalStatus = z.infer<typeof personalStatus>;

/** `POST /me/billing/payment`: the status plus the Stripe page to pay on (null when paid). */
export const paymentResponse = personalStatus.extend({ paymentUrl: z.string().nullish() });

/** One row in either invoice list, personal or organisation. */
export type InvoiceItem = {
  id: string;
  periodStart: string | null;
  status: string;
  /** Incl. GST; null while tax is being calculated. */
  totalCents: number | null;
  hasPdf: boolean;
};

export const personalInvoices = z.array(
  z
    .object({
      invoiceId: z.string(),
      periodStart: z.string().nullish(),
      status: z.string(),
      totalCents: cents.nullish(),
    })
    .loose()
    .transform((i): InvoiceItem => ({
      id: i.invoiceId,
      periodStart: i.periodStart ?? null,
      status: i.status,
      totalCents: i.totalCents ?? null,
      hasPdf: true,
    })),
);

export const organisationInvoices = z.array(
  z
    .object({
      id: z.string(),
      status: z.string(),
      totalCents: cents.nullish(),
      hasPdf: z.boolean().nullish(),
      periodStart: z.string().nullish(),
      createdAt: z.string().nullish(),
    })
    .loose()
    .transform((i): InvoiceItem => ({
      id: i.id,
      periodStart: i.periodStart ?? i.createdAt ?? null,
      status: i.status,
      totalCents: i.totalCents ?? null,
      hasPdf: i.hasPdf ?? false,
    })),
);

const term = z.enum(['monthly', 'annual']);

export const organisationPlan = z
  .object({
    planCode: z.string(),
    planName: z.string(),
    term,
    status: z.enum(['active', 'cancelling', 'cancelled']),
    committedQty: z.number().nullish(),
    currentPeriodStart: z.string(),
    currentPeriodEnd: z.string(),
    cancelAt: z.string().nullish(),
    exportUntil: z.string().nullish(),
    nextTerm: term.nullish(),
    nextCommittedQty: z.number().nullish(),
    unitCents: cents.nullish(),
  })
  .loose();
export type OrganisationPlan = z.infer<typeof organisationPlan>;

export const organisationSummary = z
  .object({
    account: z.object({ suspendedAt: z.string().nullish() }).loose(),
    plan: organisationPlan.nullish(),
    thisMonth: z
      .object({
        invoicedOn: z.string(),
        activeToday: z.number(),
        peakSoFar: z.number(),
        rateCents: cents.nullish(),
        estimateCents: cents.nullish(),
      })
      .loose(),
    overdue: z
      .object({ count: z.number(), amountCents: cents, suspensionFrom: z.string().nullish() })
      .loose(),
    allowance: z
      .array(
        z
          .object({
            metric: z.string(),
            allowance: z.number(),
            used: z.number(),
            thresholdState: z.string(),
          })
          .loose(),
      )
      .default([]),
  })
  .loose();
export type OrganisationSummary = z.infer<typeof organisationSummary>;

export const annualQuote = z
  .object({ committedQty: z.number(), monthlyPriceCents: cents, upFrontCents: cents })
  .loose();
export type AnnualQuote = z.infer<typeof annualQuote>;

export const urlResponse = z.object({ url: z.string() });
