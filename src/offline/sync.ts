import { AppState } from 'react-native';

import { useSession } from '@/auth/session';
import { toast } from '@/components/Toast/store';
import { queryClient } from '@/lib/queryClient';
import { ApiError, errorMessage, http } from '@/lib/http';
import { subscribeOnline } from '@/lib/network';
import { log } from '@/lib/log';
import { useOutbox, type OutboxItem } from './outbox';

const RETRY_EVERY_MS = 30_000;

const REFUSED: Record<OutboxItem['kind'], string> = {
  historyEntry: 'Entry not uploaded',
  entryPhoto: 'Photo not uploaded',
  caseMessage: 'Message not sent',
};
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
      // TODO(api): confirm the photo upload accepts a "caption" field.
      if (item.caption) form.append('caption', item.caption);
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
    log('sync', `entry ${item.id} saved as ${entryId ?? '(no id in response)'}`);
    if (!entryId && item.photos.length) {
      // Without the entry's id there's nowhere to upload its photos, so they're dropped.
      log('sync', `dropping ${item.photos.length} photo(s): response had no "id"`, response);
    } else if (photos.length) log('sync', `queued ${photos.length} photo upload(s)`);
    replace(item.id, photos);
    queryClient.invalidateQueries({ queryKey: ['machines', item.machineId] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  } else {
    log('sync', `${item.kind} ${item.id} sent`);
    remove(item.id);
    if (item.kind === 'entryPhoto') {
      queryClient.invalidateQueries({ queryKey: ['machines', item.machineId] });
    } else queryClient.invalidateQueries({ queryKey: ['cases', item.caseId] });
  }
}

/** One line per queued item, without photo data or tokens. */
function describe(item: OutboxItem): string {
  switch (item.kind) {
    case 'historyEntry':
      return `historyEntry ${item.id} for machine ${item.machineId}, ${item.photos.length} photo(s), body ${JSON.stringify(item.body)}`;
    case 'entryPhoto':
      return `entryPhoto ${item.id} for entry ${item.entryId}: ${item.photo.name} (${item.photo.type}) from ${item.photo.uri}`;
    case 'caseMessage':
      return `caseMessage ${item.id} for case ${item.caseId}`;
  }
}

function logFailure(item: OutboxItem, error: unknown) {
  if (error instanceof ApiError) {
    const next = error.status >= 500 || error.status === 409 ? 'will retry' : 'parked, not retried';
    log(
      'sync',
      `${item.kind} ${item.id} failed ${error.status}: ${error.message} (${next})`,
      error.details,
    );
  } else if (error instanceof Error) {
    log('sync', `${item.kind} ${item.id} failed: ${error.name}: ${error.message} (will retry)`);
  } else log('sync', `${item.kind} ${item.id} failed (will retry)`, error);
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
        const items = useOutbox.getState().items;
        const item = items.find((i) => !i.error);
        if (!item) {
          if (items.length)
            log('sync', `nothing to send: ${items.length} item(s) parked with errors`);
          return;
        }
        log('sync', `sending ${describe(item)} (attempt ${item.attempts + 1})`);
        useOutbox.getState().update(item.id, { attempts: item.attempts + 1 });
        try {
          onSent(item, await send(item));
        } catch (error) {
          logFailure(item, error);
          if (!(error instanceof ApiError) || error.status >= 500 || error.status === 409) return;
          // 422: the key was reused for a different request (a bug); 4xx: the write was refused.
          // Either way retrying unchanged can't succeed, so park it for the user.
          const message = errorMessage(error);
          useOutbox.getState().update(item.id, { error: message });
          toast.error(`${REFUSED[item.kind]}: ${message}`);
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
    const { status } = useSession.getState();
    const queued = useOutbox.getState().items.length;
    if (status !== 'signedIn') {
      if (queued) log('sync', `not sending ${queued} queued item(s): session is ${status}`);
      return;
    }
    flushOutbox().catch((error) => log('sync', 'flush crashed', String(error)));
  };
  const stopOnline = subscribeOnline((online) => {
    log('sync', online ? 'online' : 'offline');
    if (online) flush();
  });
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
