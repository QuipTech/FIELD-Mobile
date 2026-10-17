import { z } from 'zod';

const email = z.email({ error: 'Enter a valid work email' });

export const signInSchema = z.object({
  email,
  password: z.string().min(1, { error: 'Enter your password' }),
});

export type SignInValues = z.infer<typeof signInSchema>;

/**
 * The Cognito user pool's password policy (8+ chars, upper, lower, number, symbol). Stricter
 * than the M1e design copy, which omits the letter-case rules Cognito enforces.
 */
export const PASSWORD_RULE =
  'At least 8 characters, with upper and lower case, a number and a symbol';
const newPassword = z
  .string()
  .min(8, { error: 'Use at least 8 characters' })
  .regex(/\d/, { error: 'Include at least one number' })
  .regex(/[^A-Za-z0-9\s]/, { error: 'Include at least one symbol' })
  .regex(/[A-Z]/, { error: 'Include at least one uppercase letter' })
  .regex(/[a-z]/, { error: 'Include at least one lowercase letter' });

/** Cognito needs E.164 (+61400123456): keep a leading + and the digits only. */
const toE164 = (raw: string) => {
  const trimmed = raw.trim();
  return (trimmed.startsWith('+') ? '+' : '') + trimmed.replace(/\D/g, '');
};

const required = (what: string) =>
  z
    .string()
    .trim()
    .min(1, { error: `Enter your ${what}` });

export const registerSchema = z
  .object({
    firstName: required('first name'),
    lastName: required('last name'),
    // TODO(confirm): the user pool has no company attribute yet (needs `custom:company`), so this
    // is validated but not sent to Cognito.
    company: required('company name'),
    email,
    phone: z
      .string()
      .transform(toE164)
      .pipe(
        z.string().regex(/^\+[1-9]\d{7,14}$/, {
          error: 'Include your country code, e.g. +61 400 123 456',
        }),
      ),
    password: newPassword,
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine((v) => v, { error: 'Accept the terms to continue' }),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type RegisterInput = z.input<typeof registerSchema>;
export type RegisterValues = z.output<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const newPasswordSchema = z
  .object({ password: newPassword, confirm: z.string() })
  .refine((v) => v.password === v.confirm, {
    error: "Passwords don't match",
    path: ['confirm'],
  });
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;

export const CODE_LENGTH = 6;
