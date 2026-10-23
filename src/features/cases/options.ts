import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';
import { caseKeys } from './api';

const caseOptions = z
  .object({
    machines: z
      .array(
        z.object({
          id: z.string(),
          label: z.string().nullish(),
          fleetNumber: z.string().nullish(),
          serialNumber: z.string().nullish(),
          model: z.string().nullish(),
        }),
      )
      .default([]),
    categories: z
      .array(z.union([z.string(), z.object({ value: z.string(), label: z.string().nullish() })]))
      .nullish(),
  })
  .loose();

/** Fallback when `/cases/options` doesn't list categories. TODO(api): confirm the codes. */
export const DEFAULT_CATEGORIES = [
  { value: 'technical', label: 'Technical issue' },
  { value: 'parts', label: 'Parts' },
  { value: 'documentation', label: 'Documentation' },
  { value: 'other', label: 'Other' },
];

/** Machines (and categories) to pick from when raising a case. */
export function useCaseOptions() {
  return useQuery({
    queryKey: caseKeys.options,
    staleTime: 10 * 60_000,
    queryFn: async () => {
      const o = caseOptions.parse(await http.get('/cases/options'));
      return {
        machines: o.machines.map((m) => ({
          value: m.id,
          label: [m.fleetNumber || m.label || m.serialNumber, m.model].filter(Boolean).join(' · '),
        })),
        categories: o.categories?.length
          ? o.categories.map((c) =>
              typeof c === 'string'
                ? { value: c, label: c }
                : { value: c.value, label: c.label || c.value },
            )
          : DEFAULT_CATEGORIES,
      };
    },
  });
}
