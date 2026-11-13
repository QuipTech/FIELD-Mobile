import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';

/**
 * QuipTech platform admin (`platform.manage`): the same endpoints the web portal's /admin pages
 * use. Mobile shows them read-mostly; heavier editing stays in the portal.
 */

export const adminKeys = {
  users: ['platformAdmin', 'users'] as const,
  roles: ['platformAdmin', 'roles'] as const,
  permissions: ['platformAdmin', 'permissions'] as const,
  audit: (range: AuditRange) => ['platformAdmin', 'audit', range] as const,
  billing: ['platformAdmin', 'billing'] as const,
  demos: (status: string, search: string) => ['platformAdmin', 'demos', status, search] as const,
  demo: (id: string) => ['platformAdmin', 'demo', id] as const,
  aiPlatform: ['platformAdmin', 'ai', 'platform'] as const,
  aiUsage: ['platformAdmin', 'ai', 'usage'] as const,
  aiPrompts: ['platformAdmin', 'ai', 'prompts'] as const,
};

export const str = z.string().nullish();
export const num = z.number().nullish();
/** Arrays may come bare or wrapped in `items`. */
export const listOf = <T extends z.ZodTypeAny>(item: T) =>
  z.union([z.array(item), z.object({ items: z.array(item) }).transform((r) => r.items)]);

// Users -------------------------------------------------------------------------------------

const adminUser = z
  .object({
    id: z.string(),
    firstName: str,
    lastName: str,
    email: z.string(),
    avatarUrl: str,
    roles: z.array(z.string()).nullish(),
    organisation: z.object({ id: z.string(), name: z.string() }).nullish(),
    status: str,
    createdAt: str,
    lastActiveAt: str,
  })
  .loose();
export type AdminUser = z.infer<typeof adminUser>;

const usersPage = z.object({ users: z.array(adminUser), total: z.number() });

/** Every user on the platform; the portal pages through all of them and filters on device. */
export function useAdminUsers() {
  return useQuery({
    queryKey: adminKeys.users,
    queryFn: async () => {
      const users: AdminUser[] = [];
      for (let page = 1; page < 50; page += 1) {
        const res = usersPage.parse(
          await http.get('/admin/users', { query: { page, pageSize: 100 } }),
        );
        users.push(...res.users);
        if (users.length >= res.total || res.users.length === 0) break;
      }
      return users;
    },
  });
}

// Roles & permissions -----------------------------------------------------------------------

const adminRole = z
  .object({
    id: z.string(),
    name: z.string(),
    organisation: z.object({ id: z.string(), name: z.string() }).nullish(),
    isBuiltIn: z.boolean().nullish(),
    userCount: num,
    permissionCodes: z.array(z.string()).default([]),
  })
  .loose();
export type AdminRole = z.infer<typeof adminRole>;

const permission = z
  .object({ code: z.string(), label: str, description: str, group: str, category: str })
  .loose();
export type Permission = z.infer<typeof permission>;

export function useAdminRoles() {
  return useQuery({
    queryKey: adminKeys.roles,
    queryFn: async () => listOf(adminRole).parse(await http.get('/admin/roles')),
  });
}

export function useAdminPermissions() {
  return useQuery({
    queryKey: adminKeys.permissions,
    staleTime: 60 * 60_000,
    queryFn: async () => listOf(permission).parse(await http.get('/admin/permissions')),
  });
}

// Audit log ---------------------------------------------------------------------------------

export type AuditRange = '1' | '7' | '30' | 'all';
const AUDIT_PAGE = 50;

const auditEvent = z
  .object({
    id: z.string(),
    occurredAt: z.string(),
    actor: z.object({ name: z.string(), avatarUrl: str }).nullish(),
    organisationName: str,
    actionLabel: str,
    target: str,
    source: str,
  })
  .loose();
export type AuditEvent = z.infer<typeof auditEvent>;

const auditPage = z.object({ items: z.array(auditEvent), total: z.number() });

export function useAuditLog(range: AuditRange) {
  return useInfiniteQuery({
    queryKey: adminKeys.audit(range),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const from =
        range === 'all' ? undefined : new Date(Date.now() - 864e5 * Number(range)).toISOString();
      return auditPage.parse(
        await http.get('/admin/auditLog', {
          query: { page: pageParam, pageSize: AUDIT_PAGE, from },
        }),
      );
    },
    getNextPageParam: (last, pages) =>
      pages.length * AUDIT_PAGE < last.total ? pages.length + 1 : undefined,
  });
}

// Billing -----------------------------------------------------------------------------------

const billingOrg = z
  .object({
    id: str,
    organisationId: str,
    name: str,
    organisationName: str,
    organisation: z.object({ id: z.string(), name: z.string() }).nullish(),
    plan: z
      .object({ planCode: z.string(), term: str, committedQty: num, status: str })
      .loose()
      .nullish(),
    billingAccount: z
      .object({ suspendedAt: str, stripeCustomerId: str, accountName: str })
      .loose()
      .nullish(),
    overdueInvoiceCount: z.number().default(0),
    usageFlagged: z.boolean().nullish(),
  })
  .loose()
  .transform((o) => ({
    ...o,
    key: o.organisation?.id ?? o.organisationId ?? o.id ?? '',
    displayName: o.organisation?.name ?? o.organisationName ?? o.name ?? 'Organisation',
  }));
export type BillingOrg = z.infer<typeof billingOrg>;

export function useBillingOrganisations() {
  return useQuery({
    queryKey: adminKeys.billing,
    queryFn: async () => listOf(billingOrg).parse(await http.get('/admin/billing/organisations')),
  });
}
