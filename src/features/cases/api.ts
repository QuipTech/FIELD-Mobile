import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { z } from 'zod';

import { useAccess } from '@/auth/access';
import { useRole } from '@/auth/useRole';
import { uuid } from '@/lib/id';
import { http } from '@/lib/http';
import type { CasePriority, SupportCase } from './data';
import { apiCase, apiMessage, casePage, listOf, toActivity, toSupportCase } from './schema';

/**
 * Support cases (Backend API Reference §3). Customers use `/cases`; QuipTech support staff use
 * `/admin/cases`, which also returns internal notes. Customer routes never return notes.
 */

/** Polling interval for an open thread (the doc's fallback when there's no socket). */
const THREAD_POLL_MS = 15_000;
const PAGE_SIZE = 100;

export const caseKeys = {
  all: ['cases'] as const,
  list: (staff: boolean) => ['cases', 'list', staff] as const,
  one: (id: string, staff: boolean) => ['cases', id, staff] as const,
  thread: (id: string, staff: boolean) => ['cases', id, 'thread', staff] as const,
  unread: ['cases', 'unread'] as const,
  options: ['cases', 'options'] as const,
};

const base = (staff: boolean) => (staff ? '/admin/cases' : '/cases');
const casePath = (id: string, staff: boolean) => `${base(staff)}/${encodeURIComponent(id)}`;

/** Every case the user can see, newest activity first. Filtering happens on screen. */
export function useCases() {
  const { isStaff } = useRole();
  return useQuery({
    queryKey: caseKeys.list(isStaff),
    queryFn: async () => {
      const query = isStaff
        ? { tab: 'all', pageSize: PAGE_SIZE }
        : { status: 'all', pageSize: PAGE_SIZE };
      const page = casePage.parse(await http.get(base(isStaff), { query }));
      return page.items.map(toSupportCase);
    },
  });
}

export function useCase(id: string | undefined) {
  const { isStaff } = useRole();
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: caseKeys.one(id ?? '', isStaff),
    enabled: !!id,
    queryFn: async () => toSupportCase(apiCase.parse(await http.get(casePath(id!, isStaff)))),
    placeholderData: () =>
      queryClient.getQueryData<SupportCase[]>(caseKeys.list(isStaff))?.find((c) => c.id === id),
  });
}

/** The case's messages, newest first, polled while the screen is open. Marks the thread read. */
export function useCaseThread(id: string | undefined) {
  const { isStaff } = useRole();
  const myId = useAccess((s) => s.profile?.id);
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: caseKeys.thread(id ?? '', isStaff),
    enabled: !!id,
    refetchInterval: THREAD_POLL_MS,
    queryFn: async () => {
      const raw = await http.get(`${casePath(id!, isStaff)}/messages`);
      return listOf(apiMessage)
        .parse(raw)
        .map((m) => toActivity(m, myId))
        .sort((a, b) => b.at.localeCompare(a.at));
    },
  });
  const latest = query.data?.[0]?.id;
  useEffect(() => {
    if (!id || !latest || isStaff) return;
    http
      .post(`/cases/${encodeURIComponent(id)}/read`)
      .then(() => queryClient.invalidateQueries({ queryKey: caseKeys.unread }))
      .catch(() => undefined);
  }, [id, latest, isStaff, queryClient]);
  return query;
}

/** Reply (or, for staff, an internal note). Safe to retry: each send has its own key. */
export function useSendCaseMessage(id: string) {
  const { isStaff } = useRole();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ body, internal }: { body: string; internal?: boolean }) =>
      http.post(
        `${casePath(id, isStaff)}/messages`,
        isStaff ? { body, isInternal: !!internal } : { body },
        { idempotencyKey: uuid() },
      ),
    onSettled: () => queryClient.invalidateQueries({ queryKey: caseKeys.all }),
  });
}

/** Staff: assign, unassign (`assigneeId: null`), or change status / priority. */
export function useUpdateCase(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: { assigneeId?: string | null; status?: string; priority?: CasePriority }) =>
      http.patch(casePath(id, true), patch),
    onSettled: () => queryClient.invalidateQueries({ queryKey: caseKeys.all }),
  });
}

export function useReopenCase(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => http.post(`/cases/${encodeURIComponent(id)}/reopen`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: caseKeys.all }),
  });
}

const staffMember = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
});

/** Staff: people a case can be assigned to. */
export function useAssignableStaff(enabled: boolean) {
  return useQuery({
    queryKey: ['cases', 'staff'],
    enabled,
    staleTime: 10 * 60_000,
    queryFn: async () =>
      listOf(staffMember)
        .parse(await http.get('/admin/staff'))
        .map((s) => ({ id: s.id, name: s.name || s.email || 'Staff member' })),
  });
}

/** Badge count for the Cases tab. */
export function useUnreadCases() {
  return useQuery({
    queryKey: caseKeys.unread,
    refetchInterval: 60_000,
    queryFn: async () => {
      const raw = await http.get<unknown>('/cases/unread-count');
      const parsed = z.union([z.number(), z.object({ count: z.number() })]).parse(raw);
      return typeof parsed === 'number' ? parsed : parsed.count;
    },
  });
}

export type NewCase = {
  subject: string;
  description: string;
  category: string;
  priority: CasePriority;
  machineId?: string;
};

export function useRaiseCase() {
  const queryClient = useQueryClient();
  return useMutation({
    // Not idempotent on the server, so never retried automatically.
    mutationFn: async (input: NewCase) =>
      toSupportCase(apiCase.parse(await http.post('/cases', input))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: caseKeys.all }),
  });
}
