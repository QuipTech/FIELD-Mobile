import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';
import { adminKeys, str } from './api';

// Demo requests -----------------------------------------------------------------------------

export const DEMO_STATUSES = [
  { value: 'new', label: 'New', tone: 'brand' },
  { value: 'contacted', label: 'Contacted', tone: 'amber' },
  { value: 'scheduled', label: 'Scheduled', tone: 'amber' },
  { value: 'completed', label: 'Demo done', tone: 'neutral' },
  { value: 'converted', label: 'Converted', tone: 'success' },
  { value: 'lost', label: 'Lost', tone: 'danger' },
] as const;
export type DemoStatus = (typeof DEMO_STATUSES)[number]['value'];

const demoRequest = z
  .object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    phone: str,
    company: str,
    country: str,
    message: str,
    notes: str,
    status: z.string(),
    createdAt: z.string(),
    teamEmailSentAt: str,
    userEmailSentAt: str,
  })
  .loose();
export type DemoRequest = z.infer<typeof demoRequest>;

const demoPage = z.object({ items: z.array(demoRequest), total: z.number() });
const DEMO_PAGE = 25;

export function useDemoRequests(status: string, search: string) {
  return useInfiniteQuery({
    queryKey: adminKeys.demos(status, search),
    initialPageParam: 1,
    queryFn: async ({ pageParam }) =>
      demoPage.parse(
        await http.get('/admin/demo-requests', {
          query: {
            page: pageParam,
            pageSize: DEMO_PAGE,
            status: status || undefined,
            search: search || undefined,
          },
        }),
      ),
    getNextPageParam: (last, pages) =>
      pages.length * DEMO_PAGE < last.total ? pages.length + 1 : undefined,
  });
}

export function useDemoRequest(id: string) {
  return useQuery({
    queryKey: adminKeys.demo(id),
    queryFn: async () =>
      demoRequest.parse(await http.get(`/admin/demo-requests/${encodeURIComponent(id)}`)),
  });
}

export function useUpdateDemoRequest(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (patch: { status?: string; notes?: string }) =>
      demoRequest.parse(await http.patch(`/admin/demo-requests/${encodeURIComponent(id)}`, patch)),
    onSuccess: (updated) => {
      client.setQueryData(adminKeys.demo(id), updated);
      void client.invalidateQueries({ queryKey: ['platformAdmin', 'demos'] });
    },
  });
}
