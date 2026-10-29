/** Money and billing-day formatting. The API sends integer cents and dates without a time zone. */

const money = new Intl.NumberFormat('en-AU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 2900 → "A$29.00". Cents stay integers until here. */
export function formatCents(cents: number): string {
  return `A$${money.format(cents / 100)}`;
}

const DAY = new Intl.DateTimeFormat('en-AU', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const MONTH = new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** A billing day ("2026-11-01" or an ISO timestamp) as UTC midnight of that calendar day. */
function toDay(value: string, offsetDays = 0): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]) + offsetDays));
}

/** "1 Nov 2026" */
export function formatBillingDay(value: string | null | undefined): string {
  const day = value ? toDay(value) : null;
  return day ? DAY.format(day) : '—';
}

/** "November 2026" */
export function formatBillingMonth(value: string | null | undefined): string {
  const day = value ? toDay(value) : null;
  return day ? MONTH.format(day) : '—';
}

/** "1 Nov 2026 – 30 Nov 2026": the period's end is exclusive, so show the day before it. */
export function formatPeriod(start: string, endExclusive: string): string {
  const last = toDay(endExclusive, -1);
  return `${formatBillingDay(start)} – ${last ? DAY.format(last) : '—'}`;
}
