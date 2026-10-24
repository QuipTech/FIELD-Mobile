import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { z } from 'zod';

import { http } from '@/lib/http';
import { machineKeys } from './api';
import type { ComponentGroup, MachineComponent } from './records';

/** GET /machines/{id}/components: the Components tab and its per-system drill-down. */

const apiComponent = z.object({
  id: z.string(),
  systemId: z.string(),
  systemName: z.string(),
  name: z.string().nullish(),
  caption: z.string().nullish(),
  /** "ok" | "worn" | "service_due" | "fault". */
  condition: z.string().nullish(),
  /** Free text shown instead of the condition, e.g. "Fault code 168-0123". */
  conditionNote: z.string().nullish(),
  conditionSeverity: z.enum(['ok', 'warning', 'critical']).nullish().catch(null),
  partNumber: z.string().nullish(),
  serialNumber: z.string().nullish(),
  manufacturer: z.string().nullish(),
  installedAt: z.string().nullish(),
  hoursAtInstall: z.number().nullish(),
  hoursSinceInstall: z.number().nullish(),
  lastServicedAt: z.string().nullish(),
  nextServiceDueHours: z.number().nullish(),
  notes: z.string().nullish(),
});
type ApiComponent = z.infer<typeof apiComponent>;

const CONDITION: Record<string, NonNullable<ComponentGroup['issue']>> = {
  worn: { label: 'Worn', tone: 'amber' },
  service_due: { label: 'Service due', tone: 'amber' },
  fault: { label: 'Fault', tone: 'danger' },
};

/** The flag a component shows, or none when it's ok or unknown. */
function issueOf(c: ApiComponent): ComponentGroup['issue'] {
  const known = c.condition ? CONDITION[c.condition] : undefined;
  if (c.conditionSeverity === 'ok' || (!known && !c.conditionSeverity)) return undefined;
  const tone = c.conditionSeverity === 'critical' ? 'danger' : (known?.tone ?? 'amber');
  return { label: c.conditionNote || known?.label || 'Check', tone };
}

const opt = <T>(v: T | null | undefined) => v ?? undefined;

export function toComponent(c: ApiComponent): MachineComponent {
  return {
    id: c.id,
    systemId: c.systemId,
    systemName: c.systemName,
    name: c.name || c.caption || 'Component',
    caption: c.name ? opt(c.caption) : undefined,
    issue: issueOf(c),
    partNumber: opt(c.partNumber),
    serialNumber: opt(c.serialNumber),
    manufacturer: opt(c.manufacturer),
    installedAt: opt(c.installedAt),
    hoursAtInstall: opt(c.hoursAtInstall),
    hoursSinceInstall: opt(c.hoursSinceInstall),
    lastServicedAt: opt(c.lastServicedAt),
    nextServiceDueHours: opt(c.nextServiceDueHours),
    notes: opt(c.notes),
  };
}

/** Components grouped by system; a group shows its worst flagged condition. */
export function toComponentGroups(items: MachineComponent[]): ComponentGroup[] {
  const groups = new Map<string, ComponentGroup>();
  for (const c of items) {
    const group = groups.get(c.systemId) ?? { id: c.systemId, name: c.systemName, count: 0 };
    group.count += 1;
    if (c.issue && (!group.issue || (c.issue.tone === 'danger' && group.issue.tone !== 'danger')))
      group.issue = c.issue;
    groups.set(c.systemId, group);
  }
  return [...groups.values()];
}

function useComponents<T>(id: string | undefined, select: (items: MachineComponent[]) => T) {
  return useQuery({
    queryKey: machineKeys.components(id ?? ''),
    enabled: !!id,
    queryFn: async () =>
      z
        .array(apiComponent)
        .parse(await http.get(`/machines/${encodeURIComponent(id!)}/components`))
        .map(toComponent),
    select,
  });
}

const all = (items: MachineComponent[]) => items;

/** Every component on the machine, e.g. for "Component affected" when logging an entry. */
export function useComponentList(id: string | undefined) {
  return useComponents(id, all);
}

export function useMachineComponents(id: string | undefined) {
  return useComponents(id, toComponentGroups);
}

/** One system's components, from the same cached list as the Components tab. */
export function useSystemComponents(id: string | undefined, systemId: string | undefined) {
  const select = useCallback(
    (items: MachineComponent[]) => items.filter((c) => c.systemId === systemId),
    [systemId],
  );
  return useComponents(id, select);
}
