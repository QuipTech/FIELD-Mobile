import { z } from 'zod';

/** The Australian billing address Stripe Tax needs for GST (same rules as the API's DTO). */

export const AU_STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'] as const;
export type AuState = (typeof AU_STATES)[number];

export const billingAddress = z.object({
  line1: z.string().trim().min(1, 'Enter your street address').max(200, 'Too long'),
  city: z.string().trim().min(1, 'Enter your suburb or city').max(100, 'Too long'),
  state: z.enum(AU_STATES, { error: 'Choose your state or territory' }),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'Postcodes are 4 digits'),
});
export type BillingAddress = z.infer<typeof billingAddress>;
export type AddressDraft = { line1: string; city: string; state?: AuState; postalCode: string };
export type AddressErrors = Partial<Record<keyof BillingAddress, string>>;

/** The address to send, or the first message for each field that's wrong. */
export function validateAddress(
  draft: AddressDraft,
): { address: BillingAddress } | { errors: AddressErrors } {
  const parsed = billingAddress.safeParse(draft);
  if (parsed.success) return { address: parsed.data };
  const errors: AddressErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as keyof BillingAddress;
    errors[field] ??= issue.message;
  }
  return { errors };
}
