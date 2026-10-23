import { useMemo } from 'react';

import { useAccess } from './access';
import { BILLING_PERMISSION, capabilitiesFrom, type Capabilities } from './me';

export type Role = {
  roles: string[];
  permissions: string[];
  /** What the user may do, from `GET /auth/me`. Gate features on these. */
  capabilities: Capabilities;
  /** First role, for display ("Field Technician", "Technical Manager"). */
  role: string | undefined;
  /** Admin home and admin-only sections: organisation, Knowledge or platform admins. */
  isAdmin: boolean;
  isCustomer: boolean;
  /** QuipTech support: the staff case queue and internal notes. */
  isStaff: boolean;
  /** Organisation invoices, plans and the Stripe portal. */
  canManageBilling: boolean;
  /** False until access has been read from the stored session. */
  loaded: boolean;
  /** Display and broad layout only: tenants create custom roles, so prefer `can()`. */
  hasRole: (role: string | readonly string[]) => boolean;
  /** True if the user has every permission listed, e.g. `can('machine.manage')`. */
  can: (permission: string | readonly string[]) => boolean;
};

const lower = (values: readonly string[]) => values.map((v) => v.toLowerCase());

export function useRole(): Role {
  const { roles, permissions, capabilities, loaded } = useAccess();
  return useMemo(() => {
    const caps = capabilities ?? capabilitiesFrom(permissions);
    const roleSet = new Set(lower(roles));
    const permissionSet = new Set(permissions);
    const isAdmin = caps.isOrganisationAdmin || caps.isKnowledgeAdmin || caps.isPlatformAdmin;
    return {
      roles,
      permissions,
      capabilities: caps,
      role: roles[0],
      isAdmin,
      isCustomer: !isAdmin && !caps.isSupportStaff,
      isStaff: caps.isSupportStaff || caps.isPlatformAdmin,
      canManageBilling: permissionSet.has(BILLING_PERMISSION),
      loaded,
      hasRole: (role) =>
        lower(typeof role === 'string' ? [role] : role).some((r) => roleSet.has(r)),
      can: (permission) =>
        (typeof permission === 'string' ? [permission] : permission).every((p) =>
          permissionSet.has(p),
        ),
    };
  }, [roles, permissions, capabilities, loaded]);
}
