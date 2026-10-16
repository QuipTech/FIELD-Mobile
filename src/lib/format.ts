const numberFormat = new Intl.NumberFormat('en-AU', { maximumFractionDigits: 1 });

/** Machine hours: 40 → "40 h", 12480.5 → "12,480.5 h". */
export function formatHours(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || !Number.isFinite(hours)) return '— h';
  return `${numberFormat.format(hours)} h`;
}

export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** 1536 → "1.5 KB" */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit++;
  }
  return `${unit === 0 ? value : numberFormat.format(value)} ${units[unit]}`;
}

/** "3 of 50" style usage, e.g. AI allowance. */
export function formatUsage(used: number, allowance: number): string {
  return `${formatNumber(used)} of ${formatNumber(allowance)}`;
}
