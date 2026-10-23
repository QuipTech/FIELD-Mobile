import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { formatRelative } from '@/lib/date';
import { formatHours } from '@/lib/format';
import { http } from '@/lib/http';

export type MachineStatus = 'down' | 'due' | 'ok';

export type AssignedMachine = {
  id: string;
  /** e.g. "HT-2201 · CAT 793F" */
  title: string;
  detail: string;
  status: MachineStatus;
};

export type RecentEntry = { id: string; title: string; detail: string };

export type HomeData = {
  /** The site most of my machines are on; empty when none have one. */
  site: string;
  machineCount: number;
  /** Null until the API has uptime to report (no machines tracked yet). */
  uptime: { percent: number; weeks: number; weekly: number[] } | null;
  machines: AssignedMachine[];
  recent: RecentEntry[];
};

// GET /dashboard (staging, verified 2026-10-20). Only the fields Home shows are parsed.
const dashboardMachine = z.object({
  id: z.string(),
  label: z.string().nullish(),
  serialNumber: z.string(),
  manufacturer: z.string().nullish(),
  model: z.string().nullish(),
  site: z.string().nullish(),
  operatingHours: z.number().nullish(),
  status: z.string(),
});
const dashboard = z.object({
  fleetUptime: z.object({
    averagePercent: z.number().nullable(),
    weeks: z.array(z.object({ weekStart: z.string(), uptimePercent: z.number().nullable() })),
  }),
  recentActivity: z.array(
    z.object({ id: z.string(), title: z.string(), caption: z.string(), occurredAt: z.string() }),
  ),
  /** Machines I have worked on, down or service due first. */
  myMachines: z.array(dashboardMachine),
});
type Dashboard = z.infer<typeof dashboard>;

const STATUS: Record<string, MachineStatus> = { running: 'ok', down: 'down', service_due: 'due' };

function mostCommon(values: string[]): string {
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
}

export function toHomeData(d: Dashboard, now = Date.now()): HomeData {
  const weekly = d.fleetUptime.weeks
    .map((w) => w.uptimePercent)
    .filter((v): v is number => v !== null);
  return {
    site: mostCommon(d.myMachines.map((m) => m.site).filter((s): s is string => !!s)),
    machineCount: d.myMachines.length,
    uptime:
      d.fleetUptime.averagePercent === null
        ? null
        : {
            percent: Math.round(d.fleetUptime.averagePercent),
            weeks: d.fleetUptime.weeks.length,
            weekly,
          },
    machines: d.myMachines.map((m) => ({
      id: m.id,
      title: [m.label || m.serialNumber, [m.manufacturer, m.model].filter(Boolean).join(' ')]
        .filter(Boolean)
        .join(' · '),
      detail:
        [m.site, m.operatingHours != null ? formatHours(m.operatingHours) : undefined]
          .filter(Boolean)
          .join(' · ') || 'No hours recorded yet',
      status: STATUS[m.status] ?? 'ok',
    })),
    recent: d.recentActivity.map((a) => ({
      id: a.id,
      title: a.title,
      detail: `${a.caption} · ${formatRelative(a.occurredAt, now)}`,
    })),
  };
}

export const dashboardKey = ['dashboard'] as const;

/** Home in one call: uptime, recent activity and my machines. */
export function useHomeData() {
  return useQuery({
    queryKey: dashboardKey,
    queryFn: async () => toHomeData(dashboard.parse(await http.get('/dashboard'))),
  });
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
