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
  /** Empty clears the Plant ID. */
  plantId?: string;
  serialNumber?: string;
  /** Required by the API when the Plant ID or serial changes (3+ characters, kept in the audit log). */
  reason?: string;
};

/**
 * Saves Plant ID / serial (`PATCH /machines/{id}/identifiers`, one at a time like the portal),
 * site / hours (`PATCH /machines/{id}`) and status (`PATCH …/status`). Identifiers go first, so a
 * duplicate serial (409) stops the save before anything else changes.
 */
export function useEditMachine(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (edit: MachineEdit) => {
      const { status, site, operatingHours, plantId, serialNumber, reason = '' } = edit;
      const path = `/machines/${encodeURIComponent(id)}`;
      if (serialNumber !== undefined) {
        await http.patch(`${path}/identifiers`, { serialNumber: serialNumber.trim(), reason });
      }
      if (plantId !== undefined) {
        await http.patch(`${path}/identifiers`, { assetNumber: plantId.trim() || null, reason });
      }
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
  .object({
    id: z.string(),
    name: z.string().nullish(),
    model: z.string().nullish(),
    machineClass: z.string().nullish(),
  })
  .loose();
const catalogMake = z
  .object({ id: z.string().nullish(), name: z.string(), models: z.array(catalogModel).default([]) })
  .loose();
const catalog = z.union([
  z.array(catalogMake),
  z.object({ makes: z.array(catalogMake) }).transform((c) => c.makes),
]);

export type CatalogMake = {
  id: string;
  name: string;
  /** "793F · Haul truck", as the portal lists them. */
  models: { value: string; label: string }[];
};

/** The Machine library (`GET /machine-catalog`): makes, each with its models, A–Z. */
export function useMachineCatalog() {
  return useQuery({
    queryKey: ['machine-catalog'],
    staleTime: 60 * 60_000,
    queryFn: async (): Promise<CatalogMake[]> =>
      catalog
        .parse(await http.get('/machine-catalog'))
        .map((make) => ({
          id: make.id ?? make.name,
          name: make.name,
          models: make.models
            .map((m) => {
              const name = m.name || m.model || '';
              return { value: m.id, label: m.machineClass ? `${name} · ${m.machineClass}` : name };
            })
            .sort((a, b) => a.label.localeCompare(b.label)),
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
  });
}

export type NewMachine = {
  modelId: string;
  serialNumber: string;
  assetNumber?: string;
  site?: string;
  operatingHours?: number;
  status?: MachineStatus;
};

/** Registers a machine (`POST /machines`); resolves to its id. Not retried automatically. */
export function useAddMachine() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ status, ...input }: NewMachine) =>
      z
        .object({ id: z.string() })
        .loose()
        .parse(
          await http.post('/machines', { ...input, ...(status && { status: API_STATUS[status] }) }),
        ).id,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: machineKeys.all }),
  });
}
