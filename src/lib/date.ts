const LOCALE = 'en-AU';
const FALLBACK_TZ = 'Australia/Sydney';

/** Device time zone; falls back to Australia/Sydney if unavailable. */
export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TZ;
  } catch {
    return FALLBACK_TZ;
  }
}

function toDate(value: string | number | Date): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function format(value: string | number | Date, opts: Intl.DateTimeFormatOptions): string {
  const date = toDate(value);
  if (!date) return '—';
  return new Intl.DateTimeFormat(LOCALE, { timeZone: deviceTimeZone(), ...opts }).format(date);
}

/** "15 Oct 2026" */
export function formatDate(value: string | number | Date): string {
  return format(value, { day: 'numeric', month: 'short', year: 'numeric' });
}

/** "15 Oct" — for lists where the year is obvious from context. */
export function formatShortDate(value: string | number | Date): string {
  return format(value, { day: 'numeric', month: 'short' });
}

/** "2:30 pm" */
export function formatTime(value: string | number | Date): string {
  return format(value, { hour: 'numeric', minute: '2-digit' });
}

/** "Today, 2:30 pm", "Yesterday", "3 days ago", then falls back to formatDate. */
export function formatDayRelative(value: string | number | Date, now = new Date()): string {
  const date = toDate(value);
  if (!date) return '—';
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000);
  if (days === 0) return `Today, ${formatTime(date)}`;
  if (days === 1) return 'Yesterday';
  if (days > 1 && days < 7) return `${days} days ago`;
  return formatDate(date);
}

/** "15 Oct 2026, 2:30 pm" */
export function formatDateTime(value: string | number | Date): string {
  return format(value, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "just now", "5 min ago", "3 h ago", "2 d ago", then falls back to formatDate. */
export function formatRelative(value: string | number | Date, now = Date.now()): string {
  const date = toDate(value);
  if (!date) return '—';
  const diffMin = Math.round((now - date.getTime()) / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `${diffH} h ago`;
  const diffD = Math.round(diffH / 24);
  if (diffD < 7) return `${diffD} d ago`;
  return formatDate(date);
}

/** True when the calendar day of `value` is after today (device time). */
export function isFutureDay(value: string | number | Date, now = new Date()): boolean {
  const date = toDate(value);
  if (!date) return false;
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  return date.getTime() > endOfToday.getTime();
}
