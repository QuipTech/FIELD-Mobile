import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';

/** Global machine groups (`platform.manage`): machines from any organisation, shared out. */

const enc = encodeURIComponent;
const named = z.object({ id: z.string(), name: z.string() });

const group = z.object({
  id: z.string(),
  name: z.string(),
  colour: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
  machineCount: z.number().default(0),
  organisationCount: z.number().default(0),
  userCount: z.number().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type MachineGroup = z.infer<typeof group>;
export type GroupInput = { name: string; colour: string | null; description: string | null };

const machineBase = z.object({
  id: z.string(),
  label: z.string(),
  serialNumber: z.string().nullish(),
  model: z.string().nullish(),
  manufacturer: z.string().nullish(),
  status: z.string().nullish(),
  lifecycleState: z.string().nullish(),
  owningOrganisation: named.nullish(),
});
const groupMachine = machineBase.extend({ addedAt: z.string() });
export type GroupMachine = z.infer<typeof groupMachine>;
const platformMachine = machineBase.extend({
  registrationNumber: z.string().nullable().default(null),
});
export type PlatformMachine = z.infer<typeof platformMachine>;

export type AccessLevel = 'view' | 'contribute';
export type TargetType = 'organisation' | 'user';
const assignment = z.object({
  id: z.string(),
  targetType: z.enum(['organisation', 'user']),
  targetId: z.string(),
  targetName: z.string(),
  targetEmail: z.string().nullable().default(null),
  organisation: named.nullish(),
  accessLevel: z.enum(['view', 'contribute']).catch('view'),
  grantedByName: z.string().nullable().default(null),
  grantedAt: z.string(),
});
export type GroupAssignment = z.infer<typeof assignment>;

const activity = z.object({
  id: z.string(),
  action: z.string(),
  metadata: z.record(z.string(), z.unknown()).nullable().default(null),
  actorName: z.string().nullable().default(null),
  createdAt: z.string(),
});
export type GroupActivity = z.infer<typeof activity>;

export const groupKeys = {
  all: ['platformAdmin', 'machineGroups'] as const,
  list: ['platformAdmin', 'machineGroups', 'list'] as const,
  one: (id: string) => ['platformAdmin', 'machineGroups', id] as const,
  machines: (id: string) => ['platformAdmin', 'machineGroups', id, 'machines'] as const,
  access: (id: string) => ['platformAdmin', 'machineGroups', id, 'access'] as const,
  activity: (id: string) => ['platformAdmin', 'machineGroups', id, 'activity'] as const,
  search: (q: string) => ['platformAdmin', 'machineSearch', q] as const,
};

const base = (id: string) => `/admin/machine-groups/${enc(id)}`;
const once = { retry: false } as const;

export function useMachineGroups() {
  return useQuery({
    queryKey: groupKeys.list,
    queryFn: async () => z.array(group).parse(await http.get('/admin/machine-groups')),
  });
}

export function useMachineGroup(id: string) {
  return useQuery({
    queryKey: groupKeys.one(id),
    queryFn: async () => group.parse(await http.get(base(id))),
  });
}

export const useGroupMachines = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: groupKeys.machines(id),
    enabled,
    queryFn: async () => z.array(groupMachine).parse(await http.get(`${base(id)}/machines`)),
  });

export const useGroupAccess = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: groupKeys.access(id),
    enabled,
    queryFn: async () => z.array(assignment).parse(await http.get(`${base(id)}/assignments`)),
  });

export const useGroupActivity = (id: string, enabled: boolean) =>
  useQuery({
    queryKey: groupKeys.activity(id),
    enabled,
    queryFn: async () => z.array(activity).parse(await http.get(`${base(id)}/activity`)),
  });

/** Machines across every organisation (Plant ID, fleet no., serial, VIN or organisation). */
export function usePlatformMachineSearch(q: string) {
  return useQuery({
    queryKey: groupKeys.search(q),
    enabled: q.length >= 2,
    queryFn: async ({ signal }) =>
      z
        .array(platformMachine)
        .parse(
          await http.get('/admin/machines/search', { query: { search: q, limit: 50 }, signal }),
        ),
  });
}

/** Group create / edit / delete; each reloads the groups. */
export function useGroupMutations() {
  const client = useQueryClient();
  const reload = () => client.invalidateQueries({ queryKey: groupKeys.all });
  return {
    create: useMutation({
      mutationFn: async (body: GroupInput) =>
        group.parse(await http.post('/admin/machine-groups', body, once)),
      onSuccess: reload,
    }),
    update: useMutation({
      mutationFn: async ({ id, ...body }: GroupInput & { id: string }) =>
        group.parse(await http.patch(base(id), body, once)),
      onSuccess: reload,
    }),
    remove: useMutation({
      mutationFn: (id: string) => http.delete(base(id), once),
      onSuccess: () => client.removeQueries({ queryKey: groupKeys.all }),
    }),
  };
}

/** Machines and access inside one group; each change reloads the group and its tabs. */
export function useGroupMembers(id: string) {
  const client = useQueryClient();
  const reload = () => client.invalidateQueries({ queryKey: groupKeys.all });
  return {
    addMachines: useMutation({
      mutationFn: (machineIds: string[]) => http.post(`${base(id)}/machines`, { machineIds }, once),
      onSuccess: reload,
    }),
    removeMachine: useMutation({
      mutationFn: (machineId: string) =>
        http.delete(`${base(id)}/machines/${enc(machineId)}`, once),
      onSuccess: reload,
    }),
    /** Also changes the level when the target already has the group. */
    assign: useMutation({
      mutationFn: (body: { targetType: TargetType; targetId: string; accessLevel: AccessLevel }) =>
        http.post(`${base(id)}/assignments`, body, once),
      onSuccess: reload,
    }),
    revoke: useMutation({
      mutationFn: ({ assignmentId, reason }: { assignmentId: string; reason: string }) =>
        http.request(`${base(id)}/assignments/${enc(assignmentId)}`, {
          method: 'DELETE',
          body: { reason },
          retry: false,
        }),
      onSuccess: reload,
    }),
  };
}

/** "machine_added" → "Machine added". */
export const humanise = (action: string) =>
  action
    .replace(/[_.-]+/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
