import { AppState } from 'react-native';

import { useSession } from '@/auth/session';
import { queryClient } from '@/lib/queryClient';
import { ApiError, errorMessage, http } from '@/lib/http';
import { subscribeOnline } from '@/lib/network';
import { useOutbox, type OutboxItem } from './outbox';

const RETRY_EVERY_MS = 30_000;
const enc = encodeURIComponent;

function send(item: OutboxItem): Promise<unknown> {
  const opts = { idempotencyKey: item.id, retry: false as const };
  switch (item.kind) {
    case 'historyEntry':
      return http.post(`/machines/${enc(item.machineId)}/history`, item.body, opts);
    case 'entryPhoto': {
      const form = new FormData();
      // React Native's FormData takes a file descriptor object for local files.
      form.append('file', item.photo as never);
      const path = `/machines/${enc(item.machineId)}/history/${enc(item.entryId)}/photos`;
      return http.post(path, form, opts);
    }
    case 'caseMessage': {
      const base = item.staff ? '/admin/cases' : '/cases';
      return http.post(`${base}/${enc(item.caseId)}/messages`, item.body, opts);
    }
  }
}

/** After a write lands: queue its follow-ups (entry photos) and refresh what it changed. */
function onSent(item: OutboxItem, response: unknown) {
  const { replace, remove } = useOutbox.getState();
  if (item.kind === 'historyEntry') {
    const entryId = (response as { id?: string } | undefined)?.id;
    const photos = entryId
      ? item.photos.map((photo) => ({
          kind: 'entryPhoto' as const,
          machineId: item.machineId,
          entryId,
          photo,
        }))
      : [];
    replace(item.id, photos);
    queryClient.invalidateQueries({ queryKey: ['machines', item.machineId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  } else {
    remove(item.id);
    if (item.kind === 'entryPhoto') {
      queryClient.invalidateQueries({ queryKey: ['machines', item.machineId] });
    } else queryClient.invalidateQueries({ queryKey: ['cases', item.caseId] });
  }
}

let running: Promise<void> | null = null;

/**
 * Sends queued writes in order. Stops at the first one whose outcome is unknown (offline, 5xx)
 * or still in flight on the server (409), so later items never overtake it.
 */
export function flushOutbox(): Promise<void> {
  running ??= (async () => {
    try {
      for (;;) {
        const item = useOutbox.getState().items.find((i) => !i.error);
        if (!item) return;
        useOutbox.getState().update(item.id, { attempts: item.attempts + 1 });
        try {
          onSent(item, await send(item));
        } catch (error) {
          if (!(error instanceof ApiError) || error.status >= 500 || error.status === 409) return;
          // 422: the key was reused for a different request (a bug); 4xx: the write was refused.
          // Either way retrying unchanged can't succeed, so park it for the user.
          useOutbox.getState().update(item.id, { error: errorMessage(error) });
        }
      }
    } finally {
      running = null;
    }
  })();
  return running;
}

/** Retry a refused item (e.g. after access was fixed) by clearing its error. */
export function retryOutboxItem(id: string) {
  useOutbox.getState().update(id, { error: undefined });
  return flushOutbox();
}

/** Flushes on reconnect, on returning to the app, after each enqueue and every 30 s. Returns cleanup. */
export function startOutboxSync() {
  // Only with a session: a 401 while signed out would otherwise trigger the expiry sign-out.
  const flush = () => {
    if (useSession.getState().status === 'signedIn') flushOutbox().catch(() => undefined);
  };
  const stopOnline = subscribeOnline((online) => online && flush());
  const appState = AppState.addEventListener('change', (s) => s === 'active' && flush());
  const stopQueue = useOutbox.subscribe((s, prev) => {
    if (s.items.length > prev.items.length) flush();
  });
  const stopSession = useSession.subscribe((s, prev) => {
    if (s.status === 'signedIn' && prev.status !== 'signedIn') flush();
  });
  const timer = setInterval(() => {
    if (useOutbox.getState().items.some((i) => !i.error)) flush();
  }, RETRY_EVERY_MS);
  flush();
  return () => {
    stopOnline();
    appState.remove();
    stopQueue();
    stopSession();
    clearInterval(timer);
  };
}
