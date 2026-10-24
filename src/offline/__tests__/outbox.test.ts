import { queueEntry } from '@/features/capture/queue';
import { emptyDraft } from '@/features/capture/store';
import { useOutbox } from '../outbox';
import { flushOutbox } from '../sync';

jest.mock('@/auth/session', () => {
  const { create } = jest.requireActual('zustand');
  return { useSession: create(() => ({ status: 'signedIn' })) };
});

// Photo uploads go over XHR (see lib/http/xhr.ts); route them to the fetch stub so one log holds every request.
jest.mock('@/lib/http/xhr', () => ({
  xhrFetch: (url: string, init: RequestInit) => globalThis.fetch(url, init),
}));

type Call = { path: string; key: string | null; body: unknown };

/** fetch stub: answers each request with the next status in `statuses` (then 201). */
function stubFetch(statuses: (number | 'offline')[] = []) {
  const calls: Call[] = [];
  globalThis.fetch = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const path = new URL(String(input)).pathname;
    calls.push({ path, key: headers['Idempotency-Key'] ?? null, body: init?.body });
    const next = statuses.shift() ?? 201;
    if (next === 'offline') throw new TypeError('Network request failed');
    const body =
      next < 300
        ? { id: path.endsWith('/photos') ? 'p1' : 'entry-1' }
        : { statusCode: next, message: `Failed ${next}` };
    return {
      ok: next < 300,
      status: next,
      statusText: '',
      headers: { get: () => 'application/json' },
      json: async () => body,
    } as unknown as Response;
  }) as unknown as typeof fetch;
  return calls;
}

const draft = {
  ...emptyDraft({ title: 'Accumulator recharged ' }),
  machineId: 'HT-2201',
  notes: 'Held 15 min.',
  hours: '14230',
  photos: ['file:///a.jpg', 'file:///b.jpg'],
};

beforeEach(() => useOutbox.setState({ items: [] }));

describe('offline outbox', () => {
  it('posts the entry, then each photo against the real entry id, each with its own key', async () => {
    const calls = stubFetch();
    const key = queueEntry(draft);
    await flushOutbox();

    expect(calls.map((c) => c.path)).toEqual([
      '/machines/HT-2201/history',
      '/machines/HT-2201/history/entry-1/photos',
      '/machines/HT-2201/history/entry-1/photos',
    ]);
    expect(calls[0]!.key).toBe(key);
    expect(new Set(calls.map((c) => c.key)).size).toBe(3);
    expect(JSON.parse(String(calls[0]!.body))).toEqual({
      entryType: 'repair',
      description: 'Accumulator recharged\n\nHeld 15 min.',
      operatingHours: 14230,
    });
    expect(useOutbox.getState().items).toEqual([]);
  });

  it('keeps the item and its key when offline, then sends it with the same key', async () => {
    const calls = stubFetch(['offline']);
    const key = queueEntry({ ...draft, photos: [] });
    await flushOutbox();
    expect(useOutbox.getState().items).toHaveLength(1);
    await flushOutbox();
    expect(calls.map((c) => c.key)).toEqual([key, key]);
    expect(useOutbox.getState().items).toEqual([]);
  });

  it('waits on a 409 (first attempt still running) without blocking forever', async () => {
    stubFetch([409]);
    queueEntry({ ...draft, photos: [] });
    await flushOutbox();
    const [item] = useOutbox.getState().items;
    expect(item?.attempts).toBe(1);
    expect(item?.error).toBeUndefined();
  });

  it('parks a refused write with its message and moves on to the next', async () => {
    const calls = stubFetch([400]);
    queueEntry({ ...draft, photos: [] });
    queueEntry({ ...draft, title: 'Second', photos: [] });
    await flushOutbox();
    const [first, ...rest] = useOutbox.getState().items;
    expect(first?.error).toBe('Failed 400');
    expect(rest).toEqual([]);
    expect(calls).toHaveLength(2);
  });
});
