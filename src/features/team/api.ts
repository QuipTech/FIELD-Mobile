import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';

/** Team & roles for organisation admins (Backend API Reference §5). */

const role = z.object({ id: z.string(), name: z.string() }).loose();
const member = z
  .object({
    id: z.string(),
    email: z.string(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    name: z.string().nullish(),
    status: z.string().nullish(),
    roles: z.array(z.union([role, z.string()])).nullish(),
    role: role.nullish(),
  })
  .loose();

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  /** Display name of the first role. */
  role: string;
  roleId?: string;
  status: string;
};

export function toMember(m: z.infer<typeof member>): TeamMember {
  const first = m.role ?? m.roles?.[0];
  return {
    id: m.id,
    name: m.name || [m.firstName, m.lastName].filter(Boolean).join(' ') || m.email,
    email: m.email,
    role: typeof first === 'string' ? first : (first?.name ?? ''),
    roleId: typeof first === 'string' ? undefined : first?.id,
    status: m.status ?? 'active',
  };
}

const teamPage = z.object({ items: z.array(member), total: z.number() });
const teamKey = ['team'] as const;

export function useTeam(search: string) {
  return useQuery({
    queryKey: [...teamKey, 'list', search],
    queryFn: async () => {
      const page = teamPage.parse(
        await http.get('/team', { query: { search: search.trim(), pageSize: 100 } }),
      );
      return { members: page.items.map(toMember), total: page.total };
    },
  });
}

/** Roles this admin can give. */
export function useTeamRoles() {
  return useQuery({
    queryKey: [...teamKey, 'roles'],
    staleTime: 10 * 60_000,
    queryFn: async () =>
      z
        .union([z.array(role), z.object({ items: z.array(role) }).transform((r) => r.items)])
        .parse(await http.get('/team/roles')),
  });
}

export type Invitation = { email: string; firstName: string; lastName: string; roleId: string };

export function useTeamActions() {
  const queryClient = useQueryClient();
  const onSettled = () => queryClient.invalidateQueries({ queryKey: teamKey });
  return {
    invite: useMutation({
      mutationFn: (input: Invitation) => http.post('/team/invitations', input),
      onSettled,
    }),
    setRole: useMutation({
      mutationFn: ({ userId, roleId }: { userId: string; roleId: string }) =>
        http.patch(`/team/${encodeURIComponent(userId)}/role`, { roleId }),
      onSettled,
    }),
    remove: useMutation({
      mutationFn: (userId: string) => http.delete(`/team/${encodeURIComponent(userId)}`),
      onSettled,
    }),
  };
}
