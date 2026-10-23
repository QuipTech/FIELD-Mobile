import type { AiConversation } from './data';

export type HistoryGroup = { title: string; items: AiConversation[] };

const DAY_MS = 86_400_000;
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

/** Day buckets, newest first: Today, Yesterday, Previous 7 days, Earlier (empty ones dropped). */
export function groupByDay(conversations: AiConversation[], now = new Date()): HistoryGroup[] {
  const today = startOfDay(now);
  const buckets: HistoryGroup[] = [
    { title: 'Today', items: [] },
    { title: 'Yesterday', items: [] },
    { title: 'Previous 7 days', items: [] },
    { title: 'Earlier', items: [] },
  ];
  const sorted = [...conversations].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  for (const c of sorted) {
    const days = Math.round((today - startOfDay(new Date(c.at))) / DAY_MS);
    const index = days <= 0 ? 0 : days === 1 ? 1 : days < 8 ? 2 : 3;
    buckets[index]?.items.push(c);
  }
  return buckets.filter((g) => g.items.length > 0);
}

/** Matches the question or machine, ignoring case. */
export function matchesSearch(c: AiConversation, query: string) {
  const q = query.trim().toLowerCase();
  return !q || c.question.toLowerCase().includes(q) || !!c.machine?.toLowerCase().includes(q);
}
