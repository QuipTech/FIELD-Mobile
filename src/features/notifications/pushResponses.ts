import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { http } from '@/lib/http';
import { notificationRoute } from '@/lib/links';
import { log } from '@/lib/log';
import { queryClient } from '@/lib/queryClient';
import { notificationKeys } from './api';

/**
 * What the app does with a push: shows it while the app is open (and refreshes the feed and
 * badge), and on a tap opens the screen its `link` points at and marks it read.
 * Proposed payload: `data: { notificationId, kind, link }` (the backend may still change it).
 */

type PushData = { notificationId?: string; kind?: string; link?: string };

/**
 * Custom keys of a raw push. iOS: `content.data` is only the payload's `body` key, so top-level
 * keys are read from the trigger's payload. Android: the FCM message's data.
 */
export function pushData(request: Notifications.NotificationRequest): PushData {
  const trigger = request.trigger as {
    payload?: Record<string, unknown>;
    remoteMessage?: { data?: Record<string, unknown> };
  } | null;
  const merged = {
    ...trigger?.payload,
    ...trigger?.remoteMessage?.data,
    ...(request.content.data as Record<string, unknown> | null),
  };
  const str = (key: string) => (typeof merged[key] === 'string' ? merged[key] : undefined);
  return { notificationId: str('notificationId'), kind: str('kind'), link: str('link') };
}

/** Banner and sound while the app is open; the feed and bell refresh behind it. */
export function configureForegroundPush() {
  if (Platform.OS === 'web') return;
  Notifications.setNotificationHandler({
    handleNotification: async () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      return {
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });
}

/** Responses already acted on, so a cold-start tap isn't replayed after signing in again. */
const handled = new Set<string>();

function openPush(response: Notifications.NotificationResponse) {
  const { request } = response.notification;
  if (handled.has(request.identifier)) return;
  handled.add(request.identifier);
  const { notificationId, link } = pushData(request);
  log('push', `opened ${notificationId ?? request.identifier} → ${link ?? '(no link)'}`);
  if (notificationId) {
    http
      .post(`/notifications/${encodeURIComponent(notificationId)}/read`)
      .catch(() => undefined)
      .finally(() => queryClient.invalidateQueries({ queryKey: notificationKeys.all }));
  }
  router.push((notificationRoute(link) ?? '/notifications') as Href);
}

/**
 * Opens tapped pushes once the signed-in app is on screen, including the tap that launched
 * the app.
 */
export function usePushResponses(enabled: boolean) {
  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;
    const last = Notifications.getLastNotificationResponse();
    if (last) openPush(last);
    const sub = Notifications.addNotificationResponseReceivedListener(openPush);
    return () => sub.remove();
  }, [enabled]);
}
