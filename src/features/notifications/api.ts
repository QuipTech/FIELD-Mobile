import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { z } from 'zod';

import { http } from '@/lib/http';
import { notificationRoute } from '@/lib/links';
import type { AppNotification, NotificationKind } from './data';

/** Notification feed and read state, kept on the server (Backend API Reference §6). */

export const notificationKeys = {
  all: ['notifications'] as const,
  feed: ['notifications', 'feed'] as const,
  unread: ['notifications', 'unread'] as const,
};

const apiNotification = z
  .object({
    id: z.string(),
    kind: z.string().nullish(),
    type: z.string().nullish(),
    title: z.string().nullish(),
    body: z.string().nullish(),
    message: z.string().nullish(),
    /** Portal path it is about, e.g. `/cases/1042`. */
    link: z.string().nullish(),
    createdAt: z.string(),
    isRead: z.boolean().nullish(),
    readAt: z.string().nullish(),
    caseNumber: z.union([z.number(), z.string()]).nullish(),
    machineId: z.string().nullish(),
    data: z
      .object({
        caseNumber: z.union([z.number(), z.string()]).nullish(),
        machineId: z.string().nullish(),
      })
      .loose()
      .nullish(),
  })
  .loose();
export type ApiNotification = z.infer<typeof apiNotification>;

const feedPage = z.union([
  z.array(apiNotification).transform((items) => ({ items, nextBefore: null })),
  z.object({ items: z.array(apiNotification), nextBefore: z.string().nullish() }),
]);
export type NotificationPage = { items: AppNotification[]; nextBefore: string | null };
type Feed = InfiniteData<NotificationPage, string | undefined>;
const PAGE_SIZE = 30;

const KIND: Record<string, NotificationKind> = {
  case_message: 'caseUpdate',
  case_assigned: 'caseUpdate',
  case_status: 'caseUpdate',
  case_priority: 'caseUpdate',
  machine_status: 'machineDown',
  ai_review: 'aiReview',
  knowledge_document: 'manualUpdate',
  alert: 'alert',
};

export function toNotification(n: ApiNotification): AppNotification {
  const body = n.body || n.message || '';
  // The live API sends only `link`; older shapes name the case or machine directly.
  const route = notificationRoute(n.link);
  const caseNumber = n.caseNumber ?? n.data?.caseNumber ?? route?.match(/^\/case\/(.+)$/)?.[1];
  const linkedMachine = route?.match(/^\/machine\/(.+)$/)?.[1];
  return {
    id: n.id,
    kind: KIND[n.kind || n.type || ''] ?? 'alert',
    title: n.title || body.split('\n')[0] || 'Notification',
    summary: n.title ? (body.split('\n')[0] ?? '') : '',
    at: n.createdAt,
    body,
    machineId: n.machineId ?? n.data?.machineId ?? linkedMachine,
    link: n.link ?? undefined,
    caseId: caseNumber != null ? String(caseNumber) : undefined,
    unread: n.isRead === undefined || n.isRead === null ? !n.readAt : !n.isRead,
  };
}

/** Newest first, paged with `before` = the previous page's `nextBefore` (null on the last). */
export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationKeys.feed,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }): Promise<NotificationPage> => {
      const query = { limit: PAGE_SIZE, before: pageParam };
      const page = feedPage.parse(await http.get('/notifications', { query }));
      return { items: page.items.map(toNotification), nextBefore: page.nextBefore ?? null };
    },
    getNextPageParam: (last) => last.nextBefore ?? undefined,
  });
}

/** Bell badge, mirrored on the app icon. Cheap on the server, so it's polled. */
export function useUnreadNotifications() {
  return useQuery({
    queryKey: notificationKeys.unread,
    refetchInterval: 60_000,
    queryFn: async () => {
      const raw = await http.get<unknown>('/notifications/unread-count');
      const parsed = z.union([z.number(), z.object({ count: z.number() })]).parse(raw);
      const count = typeof parsed === 'number' ? parsed : parsed.count;
      if (Platform.OS !== 'web') Notifications.setBadgeCountAsync(count).catch(() => undefined);
      return count;
    },
  });
}

function markLocally(queryClient: QueryClient, ids: string[] | 'all') {
  const read = (n: AppNotification) =>
    ids === 'all' || ids.includes(n.id) ? { ...n, unread: false } : n;
  queryClient.setQueryData<Feed>(
    notificationKeys.feed,
    (feed) =>
      feed && { ...feed, pages: feed.pages.map((p) => ({ ...p, items: p.items.map(read) })) },
  );
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.post(`/notifications/${encodeURIComponent(id)}/read`),
    onMutate: (id) => markLocally(queryClient, [id]),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => http.post('/notifications/read-all'),
    onMutate: () => markLocally(queryClient, 'all'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });
}

const prefs = z.object({
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  mutedKinds: z.array(z.string()).default([]),
});
export type NotificationPrefs = z.infer<typeof prefs>;
const prefsKey = ['notifications', 'preferences'] as const;

/** Push / email preferences; everything is on until the user saves. */
export function useNotificationPrefs() {
  return useQuery({
    queryKey: prefsKey,
    queryFn: async () => prefs.parse(await http.get('/me/notification-preferences')),
  });
}

/** Saves the whole set (PUT), updating the cache straight away. */
export function useSaveNotificationPrefs() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (next: NotificationPrefs) => http.put('/me/notification-preferences', next),
    onMutate: (next) => {
      const previous = queryClient.getQueryData<NotificationPrefs>(prefsKey);
      queryClient.setQueryData(prefsKey, next);
      return { previous };
    },
    onError: (_error, _next, context) => queryClient.setQueryData(prefsKey, context?.previous),
  });
}
