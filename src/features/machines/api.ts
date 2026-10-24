import { useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';
import type { Machine, MachineStatus } from './data';
import type { EntryType, TimelineEntry } from './records';

/**
 * FIELD API machines endpoints (staging, verified 2026-10-20). Responses are parsed and turned
 * into the shapes the screens already use, so screens never see raw API fields.
 */

const apiMachine = z.object({
  id: z.string(),
  label: z.string().nullish(),
  fleetNumber: z.string().nullish(),
  serialNumber: z.string(),
  manufacturer: z.string().nullish(),
  model: z.string().nullish(),
  site: z.string().nullish(),
  operatingHours: z.number().nullish(),
  status: z.string(),
  photoUrl: z.string().nullish(),
  assignedTechnicians: z.array(z.unknown()).nullish(),
});
export type ApiMachine = z.infer<typeof apiMachine>;

const machinePage = z.object({ items: z.array(apiMachine), total: z.number() });

const STATUS: Record<string, MachineStatus> = { running: 'ok', down: 'down', service_due: 'due' };

export function toMachine(m: ApiMachine): Machine {
  const make = m.manufacturer ?? '';
  return {
    id: m.id,
    label: m.fleetNumber || m.label || m.serialNumber,
    make,
    model: [make, m.model].filter(Boolean).join(' '),
    status: STATUS[m.status] ?? 'ok',
    site: m.site ?? '',
    hours: m.operatingHours ?? undefined,
    serial: m.serialNumber,
    photoUrl: m.photoUrl ?? undefined,
    technicianCount: m.assignedTechnicians?.length,
  };
}

export const machineKeys = {
  all: ['machines'] as const,
  one: (id: string) => ['machines', id] as const,
  history: (id: string) => ['machines', id, 'history'] as const,
  components: (id: string) => ['machines', id, 'components'] as const,
};

const PAGE_SIZE = 100;
const MAX_PAGES = 20;

/** The whole fleet (every page), so search, filters and asset-tag scans work offline. */
export function useMachines() {
  return useQuery({
    queryKey: machineKeys.all,
    queryFn: async () => {
      const items: ApiMachine[] = [];
      for (let page = 1; page <= MAX_PAGES; page++) {
        const res = machinePage.parse(
          await http.get('/machines', { query: { page, pageSize: PAGE_SIZE } }),
        );
        items.push(...res.items);
        if (items.length >= res.total || res.items.length < PAGE_SIZE) break;
      }
      return items.map(toMachine);
    },
  });
}

export function useMachine(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: machineKeys.one(id ?? ''),
    enabled: !!id,
    queryFn: async () =>
      toMachine(apiMachine.parse(await http.get(`/machines/${encodeURIComponent(id!)}`))),
    // Opened from the list: show that row at once while the detail loads.
    placeholderData: () =>
      queryClient.getQueryData<Machine[]>(machineKeys.all)?.find((m) => m.id === id),
  });
}

const apiHistoryEntry = z.object({
  id: z.string(),
  entryType: z.string(),
  description: z.string(),
  createdAt: z.string(),
  author: z.object({ name: z.string() }).nullish(),
  operatingHours: z.number().nullish(),
  downtimeHours: z.number().nullish(),
  photos: z.array(z.unknown()).default([]),
  /** The component the entry is about; only its names are shown. */
  component: z
    .object({ name: z.string().nullish(), systemName: z.string().nullish() })
    .nullish()
    .catch(null),
});

// The API sends `signedUrl`, valid for 15 min; history goes stale after a minute, so revisits refetch.
const PHOTO_URL_KEYS = ['signedUrl', 'thumbnailUrl', 'url', 'photoUrl', 'fileUrl'] as const;

/** A history photo's image URL: a bare string, or the first URL field the API sends. */
function photoUrlOf(photo: unknown): string | undefined {
  if (typeof photo === 'string') return photo;
  if (!photo || typeof photo !== 'object') return undefined;
  const p = photo as Record<string, unknown>;
  const url = PHOTO_URL_KEYS.map((k) => p[k]).find((v) => typeof v === 'string' && v);
  return url as string | undefined;
}

const ENTRY_TYPES: EntryType[] = ['repair', 'inspection', 'fault', 'service', 'note'];

export function toTimelineEntry(e: z.infer<typeof apiHistoryEntry>): TimelineEntry {
  const component = [e.component?.systemName, e.component?.name].filter(Boolean).join(' › ');
  const facts = [
    component || undefined,
    e.operatingHours != null ? `${e.operatingHours.toLocaleString('en-AU')} h` : undefined,
    e.downtimeHours ? `${e.downtimeHours} h downtime` : undefined,
  ].filter(Boolean);
  const urls = e.photos.map(photoUrlOf).filter(Boolean);
  return {
    id: e.id,
    type: ENTRY_TYPES.includes(e.entryType as EntryType) ? (e.entryType as EntryType) : 'note',
    title: e.description,
    detail: facts.length ? facts.join(' · ') : undefined,
    at: e.createdAt,
    by: e.author?.name ?? 'System',
    photos: e.photos.length || undefined,
    photoUris: urls.length ? e.photos.map((p) => photoUrlOf(p) ?? '') : undefined,
  };
}

export function useMachineHistory(id: string | undefined) {
  return useQuery({
    queryKey: machineKeys.history(id ?? ''),
    enabled: !!id,
    queryFn: async () =>
      z
        .array(apiHistoryEntry)
        .parse(await http.get(`/machines/${encodeURIComponent(id!)}/history`))
        .map(toTimelineEntry),
  });
}
