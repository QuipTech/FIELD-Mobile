import { z } from 'zod';

/**
 * `GET /auth/me` (Backend API Reference §5). Roles are display names and tenants add their own,
 * so features gate on `capabilities` (or permission codes), never on role names.
 */

export type Capabilities = {
  isPlatformAdmin: boolean;
  isOrganisationAdmin: boolean;
  isKnowledgeAdmin: boolean;
  isSupportStaff: boolean;
  canUseAi: boolean;
  canManageMachines: boolean;
};

/** Each capability maps to one permission; used when an older payload has no `capabilities`. */
export const CAPABILITY_PERMISSION: Record<keyof Capabilities, string> = {
  isPlatformAdmin: 'platform.manage',
  isOrganisationAdmin: 'admin.manage_users',
  isKnowledgeAdmin: 'knowledge.publish',
  isSupportStaff: 'support.agent',
  canUseAi: 'ai.use',
  canManageMachines: 'machine.manage',
};

/** Organisation billing (plan, invoices, Stripe portal): Owner and Organisation Admin. */
export const BILLING_PERMISSION = 'billing.manage';

export function capabilitiesFrom(
  permissions: readonly string[],
  given?: Partial<Capabilities> | null,
): Capabilities {
  const set = new Set(permissions);
  const entries = Object.entries(CAPABILITY_PERMISSION).map(([key, permission]) => [
    key,
    given?.[key as keyof Capabilities] ?? set.has(permission),
  ]);
  return Object.fromEntries(entries) as Capabilities;
}

export type MeProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  phoneNumber: string | null;
  site: string | null;
  language: string | null;
  tenant: { id: string; name: string; slug?: string } | null;
};

// Roles/permissions may arrive as plain codes or as objects; keep the code.
const code = z.union([
  z.string(),
  z.object({ code: z.string() }).transform((r) => r.code),
  z.object({ key: z.string() }).transform((r) => r.key),
  z.object({ name: z.string() }).transform((r) => r.name),
]);
const flag = z.boolean().optional();

const meUser = z
  .object({
    id: z.string().optional(),
    email: z.string().optional(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    avatarUrl: z.string().nullish(),
    phoneNumber: z.string().nullish(),
    site: z.string().nullish(),
    language: z.string().nullish(),
    roles: z.array(code).default([]),
    permissions: z.array(code).default([]),
    capabilities: z
      .object({
        isPlatformAdmin: flag,
        isOrganisationAdmin: flag,
        isKnowledgeAdmin: flag,
        isSupportStaff: flag,
        canUseAi: flag,
        canManageMachines: flag,
      })
      .nullish(),
    tenant: z.object({ id: z.string(), name: z.string(), slug: z.string().nullish() }).nullish(),
  })
  .loose();

/** The documented shape is the user at the top level; older builds wrapped it. */
export const meResponse = z.union([
  z.object({ data: z.object({ user: meUser }) }).transform((r) => r.data.user),
  z.object({ user: meUser }).transform((r) => r.user),
  z.object({ data: meUser }).transform((r) => r.data),
  meUser,
]);

export type Me = {
  roles: string[];
  permissions: string[];
  capabilities: Capabilities;
  profile: MeProfile | null;
};

export function toMe(raw: unknown): Me {
  const u = meResponse.parse(raw);
  return {
    roles: u.roles,
    permissions: u.permissions,
    capabilities: capabilitiesFrom(u.permissions, u.capabilities),
    profile:
      u.id && u.email
        ? {
            id: u.id,
            email: u.email,
            firstName: u.firstName ?? '',
            lastName: u.lastName ?? '',
            avatarUrl: u.avatarUrl ?? null,
            phoneNumber: u.phoneNumber ?? null,
            site: u.site ?? null,
            language: u.language ?? null,
            tenant: u.tenant ? { ...u.tenant, slug: u.tenant.slug ?? undefined } : null,
          }
        : null,
  };
}
