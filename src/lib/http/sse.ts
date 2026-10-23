import { fetch as expoFetch } from 'expo/fetch';

import { env } from '../env';
import { getToken, notifySessionExpired, refreshToken } from './auth';
import { NetworkError, toApiError } from './errors';

export type SseEvent = { event: string; data: string };

/** Splits a server-sent-events buffer into complete events plus the unfinished remainder. */
export function parseSse(buffer: string): { events: SseEvent[]; rest: string } {
  const blocks = buffer.replace(/\r\n/g, '\n').split('\n\n');
  const rest = blocks.pop() ?? '';
  const events = blocks.flatMap((block) => {
    let event = 'message';
    const data: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data.push(line.slice(5).replace(/^ /, ''));
    }
    return data.length ? [{ event, data: data.join('\n') }] : [];
  });
  return { events, rest };
}

async function open(path: string, body: unknown, token: string | null, signal?: AbortSignal) {
  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  try {
    // expo/fetch exposes the response body as a stream on iOS and Android.
    return await expoFetch(`${env.apiBaseUrl}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new NetworkError('Network request failed');
  }
}

/**
 * POSTs JSON and reads the `text/event-stream` response, calling `onEvent` per event.
 * Non-2xx responses (sent as normal JSON before streaming starts) throw an `ApiError`.
 */
export async function postEventStream(
  path: string,
  body: unknown,
  onEvent: (event: SseEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  let res = await open(path, body, await getToken(), signal);
  if (res.status === 401) {
    const fresh = await refreshToken();
    if (!fresh) notifySessionExpired();
    else res = await open(path, body, fresh, signal);
  }
  if (!res.ok) throw await toApiError(res as unknown as Response);
  if (!res.body) throw new NetworkError('No response stream');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const { events, rest } = parseSse(buffer);
    buffer = rest;
    events.forEach(onEvent);
  }
  const { events } = parseSse(`${buffer}\n\n`);
  events.forEach(onEvent);
}
