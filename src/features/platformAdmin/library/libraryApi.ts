import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';

/** Machine library (`platform.manage`): the shared model catalogue and each model's system tree. */

const enc = encodeURIComponent;
const named = z.object({ id: z.string(), name: z.string() });

const modelSummary = z.object({
  id: z.string(),
  manufacturerName: z.string(),
  name: z.string(),
  displayName: z.string(),
  category: z.string().nullable().default(null),
  /** null = shared with every organisation. */
  organisation: named.nullable().default(null),
  isEditable: z.boolean().default(false),
  systemsCount: z.number().default(0),
  assetsCount: z.number().default(0),
});
export type MachineModelSummary = z.infer<typeof modelSummary>;

const tree = z.object({
  modelId: z.string(),
  systems: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        componentCount: z.number().default(0),
        components: z.array(named).default([]),
      }),
    )
    .default([]),
});
export type ModelSystemTree = z.infer<typeof tree>;
export type ModelSystem = ModelSystemTree['systems'][number];

export type NewModel = { manufacturerName: string; name: string; category?: string };

export const libraryKeys = {
  all: ['platformAdmin', 'machineModels'] as const,
  list: (search: string) => ['platformAdmin', 'machineModels', 'list', search] as const,
  tree: (id: string) => ['platformAdmin', 'machineModels', 'tree', id] as const,
};

export function useMachineModels(search: string) {
  return useQuery({
    queryKey: libraryKeys.list(search),
    placeholderData: keepPreviousData,
    queryFn: async ({ signal }) =>
      z
        .array(modelSummary)
        .parse(await http.get('/admin/machineModels', { query: search ? { search } : {}, signal })),
  });
}

export function useModelActions() {
  const client = useQueryClient();
  const reload = () => client.invalidateQueries({ queryKey: libraryKeys.all });
  return {
    create: useMutation({
      mutationFn: async (body: NewModel) =>
        modelSummary.parse(await http.post('/admin/machineModels', body, { retry: false })),
      onSuccess: reload,
    }),
    remove: useMutation({
      mutationFn: (id: string) => http.delete(`/admin/machineModels/${enc(id)}`, { retry: false }),
      onSuccess: reload,
    }),
  };
}

export function useModelTree(modelId: string) {
  return useQuery({
    queryKey: libraryKeys.tree(modelId),
    queryFn: async () => tree.parse(await http.get(`/admin/machineModels/${enc(modelId)}/tree`)),
  });
}

export type TreeChange =
  | { kind: 'addSystem'; name: string }
  | { kind: 'renameSystem'; systemId: string; name: string }
  | { kind: 'deleteSystem'; systemId: string }
  | { kind: 'addComponent'; systemId: string; name: string }
  | { kind: 'renameComponent'; componentId: string; name: string }
  | { kind: 'deleteComponent'; componentId: string };

function sendChange(modelId: string, c: TreeChange): Promise<unknown> {
  const opts = { retry: false } as const;
  switch (c.kind) {
    case 'addSystem':
      return http.post(`/admin/machineModels/${enc(modelId)}/systems`, { name: c.name }, opts);
    case 'renameSystem':
      return http.patch(`/admin/modelSystems/${enc(c.systemId)}`, { name: c.name }, opts);
    case 'deleteSystem':
      return http.delete(`/admin/modelSystems/${enc(c.systemId)}`, opts);
    case 'addComponent':
      return http.post(`/admin/modelSystems/${enc(c.systemId)}/components`, { name: c.name }, opts);
    case 'renameComponent':
      return http.patch(`/admin/modelComponents/${enc(c.componentId)}`, { name: c.name }, opts);
    case 'deleteComponent':
      return http.delete(`/admin/modelComponents/${enc(c.componentId)}`, opts);
  }
}

/** Every change returns the refreshed tree, which replaces the cached one as is. */
export function useTreeChange(modelId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (change: TreeChange) => {
      const res = await sendChange(modelId, change);
      const parsed = tree.safeParse(res);
      return parsed.success ? parsed.data : undefined;
    },
    onSuccess: (next) => {
      if (next) client.setQueryData(libraryKeys.tree(modelId), next);
      // No tree in the body (e.g. a bare 204): fetch it.
      else void client.invalidateQueries({ queryKey: libraryKeys.tree(modelId) });
      // System counts on the list change too.
      void client.invalidateQueries({ queryKey: ['platformAdmin', 'machineModels', 'list'] });
    },
  });
}
