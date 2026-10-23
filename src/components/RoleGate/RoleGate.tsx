import type { ReactNode } from 'react';

import { useRole } from '@/auth/useRole';

export type RoleGateProps = {
  children: ReactNode;
  /** Every permission code listed is required, e.g. `can="machines.edit"`. Prefer this. */
  can?: string | readonly string[];
  /** At least one of these roles (broad layout choices only). */
  allow?: readonly string[];
  /** None of these roles. */
  deny?: readonly string[];
  /** Rendered instead when the check fails (default: nothing). */
  fallback?: ReactNode;
};

/**
 * Shows or hides UI by permission or role. It only hides: the API still enforces every
 * action, and a 403 shows NoAccess wherever it happens.
 */
export function RoleGate({ children, can, allow, deny, fallback = null }: RoleGateProps) {
  const role = useRole();
  const allowed =
    (can === undefined || role.can(can)) &&
    (allow === undefined || role.hasRole(allow)) &&
    (deny === undefined || !role.hasRole(deny));
  return <>{allowed ? children : fallback}</>;
}
