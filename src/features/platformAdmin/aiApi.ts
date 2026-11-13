import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';
import { adminKeys, listOf, num, str } from './api';

// AI configuration --------------------------------------------------------------------------

const aiPlatform = z
  .object({
    provider: z.string(),
    region: str,
    models: z
      .array(z.object({ role: z.string(), label: z.string(), modelId: str, purpose: str }).loose())
      .default([]),
  })
  .loose();
export type AiPlatform = z.infer<typeof aiPlatform>;

const aiUsage = z
  .object({
    totalQueries: z.number().default(0),
    changePercent: num,
    activeUsers: z.number().default(0),
    totalUsers: z.number().default(0),
    avgCostPerQuery: z.number().default(0),
    totalCost: z.number().default(0),
    unreviewedCount: z.number().default(0),
    flaggedInPeriod: z.number().default(0),
  })
  .loose();
export type AiUsage = z.infer<typeof aiUsage>;

const promptVersion = z
  .object({
    id: z.string(),
    versionNumber: z.number(),
    isLive: z.boolean().nullish(),
    notes: str,
    createdAt: z.string(),
    createdByName: str,
    publishedAt: str,
    publishedByName: str,
  })
  .loose();
export type PromptVersion = z.infer<typeof promptVersion>;

export function useAiPlatform() {
  return useQuery({
    queryKey: adminKeys.aiPlatform,
    queryFn: async () => aiPlatform.parse(await http.get('/admin/ai/platform')),
  });
}

export function useAiUsage() {
  return useQuery({
    queryKey: adminKeys.aiUsage,
    queryFn: async () => aiUsage.parse(await http.get('/admin/ai/usage', { query: { days: 30 } })),
  });
}

export function useAiPrompts() {
  return useQuery({
    queryKey: adminKeys.aiPrompts,
    queryFn: async () => listOf(promptVersion).parse(await http.get('/admin/ai/prompts')),
  });
}
