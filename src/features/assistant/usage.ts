import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';

const allowance = z.object({
  used: z.number(),
  allowance: z.number().nullish(),
  remaining: z.number().nullish(),
});

// GET /ai/usage (Backend API Reference §2). Usage is reported, never blocked.
const usage = z.object({
  personal: allowance,
  organisation: allowance.extend({ isEnabled: z.boolean().nullish() }),
  warningThreshold: z.number().nullish(),
  periodStart: z.string().nullish(),
  periodEnd: z.string().nullish(),
});

export type Allowance = { used: number; limit: number };

export type AiUsageReport = {
  personal: Allowance;
  organisation: Allowance & { enabled: boolean };
  /** Share of the allowance (0–1) at which to warn, e.g. 0.8. */
  warnAt: number;
  /** ISO date the allowance resets. */
  resetsOn: string | undefined;
};

const toAllowance = (a: z.infer<typeof allowance>): Allowance => ({
  used: a.used,
  limit: a.allowance ?? a.used + (a.remaining ?? 0),
});

export function toUsage(raw: unknown): AiUsageReport {
  const u = usage.parse(raw);
  return {
    personal: toAllowance(u.personal),
    organisation: { ...toAllowance(u.organisation), enabled: u.organisation.isEnabled ?? true },
    warnAt: u.warningThreshold ?? 0.8,
    resetsOn: u.periodEnd ?? undefined,
  };
}

export const aiUsageKey = ['ai', 'usage'] as const;

/** This month's AI usage for the user and their organisation. Needs `ai.use`. */
export function useAiUsageReport(enabled = true) {
  return useQuery({
    queryKey: aiUsageKey,
    enabled,
    staleTime: 5 * 60_000,
    queryFn: async () => toUsage(await http.get('/ai/usage')),
  });
}
