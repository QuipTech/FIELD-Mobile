import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';
import { machineKeys } from './api';
import type { MachineStatus } from './data';

const API_STATUS: Record<MachineStatus, string> = {
  ok: 'running',
  down: 'down',
  due: 'service_due',
};

export type MachineEdit = {
  /** Empty clears the site. */
  site?: string;
  operatingHours?: number;
  status?: MachineStatus;
};

/** Saves site / hours (`PATCH /machines/{id}`) and status (`PATCH …/status`). */
export function useEditMachine(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ status, site, operatingHours }: MachineEdit) => {
      const path = `/machines/${encodeURIComponent(id)}`;
      if (site !== undefined || operatingHours !== undefined) {
        await http.patch(path, {
          ...(site !== undefined && { site: site.trim() || null }),
          ...(operatingHours !== undefined && { operatingHours }),
        });
      }
      if (status) await http.patch(`${path}/status`, { status: API_STATUS[status] });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: machineKeys.all }),
  });
}

const catalogModel = z
  .object({ id: z.string(), name: z.string().nullish(), model: z.string().nullish() })
  .loose();
const catalog = z.union([
  z.array(
    z
      .object({
        id: z.string().nullish(),
        name: z.string(),
        models: z.array(catalogModel).default([]),
      })
      .loose(),
  ),
  z
    .object({
      makes: z.array(
        z.object({ name: z.string(), models: z.array(catalogModel).default([]) }).loose(),
      ),
    })
    .transform((c) => c.makes),
]);

/** Makes and models for "Add machine", flattened to picker options ("CAT 793F"). */
export function useMachineCatalog() {
  return useQuery({
    queryKey: ['machine-catalog'],
    staleTime: 60 * 60_000,
    queryFn: async () =>
      catalog
        .parse(await http.get('/machine-catalog'))
        .flatMap((make) =>
          make.models.map((m) => ({
            value: m.id,
            label: `${make.name} ${m.name || m.model || ''}`.trim(),
          })),
        )
        .sort((a, b) => a.label.localeCompare(b.label)),
  });
}

export type NewMachine = {
  modelId: string;
  serialNumber: string;
  assetNumber?: string;
  site?: string;
  operatingHours?: number;
};

/** Registers a machine (`POST /machines`); resolves to its id. Not retried automatically. */
export function useAddMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewMachine) =>
      z
        .object({ id: z.string() })
        .loose()
        .parse(await http.post('/machines', input)).id,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: machineKeys.all }),
  });
}
