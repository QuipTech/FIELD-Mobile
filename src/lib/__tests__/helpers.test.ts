import { formatDayRelative, formatRelative, formatShortDate, isFutureDay } from '../date';
import { formatBytes, formatHours } from '../format';
import { cleanLine, cleanText } from '../sanitize';

describe('format', () => {
  it('formats machine hours as "N h"', () => {
    expect(formatHours(40)).toBe('40 h');
    expect(formatHours(12480.5)).toBe('12,480.5 h');
    expect(formatHours(null)).toBe('— h');
  });

  it('formats bytes', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
  });
});

describe('date', () => {
  const now = new Date('2026-10-15T12:00:00');
  it('detects future calendar days', () => {
    expect(isFutureDay('2026-10-16T08:00:00', now)).toBe(true);
    expect(isFutureDay('2026-10-15T23:00:00', now)).toBe(false);
  });

  it('formats relative times', () => {
    expect(formatRelative(now.getTime() - 5 * 60_000, now.getTime())).toBe('5 min ago');
    expect(formatRelative(now.getTime() - 3 * 3_600_000, now.getTime())).toBe('3 h ago');
  });

  it('formats short dates and day-relative times', () => {
    expect(formatShortDate('2026-03-12T12:00:00')).toBe('12 Mar');
    expect(formatDayRelative('2026-10-15T09:12:00', now)).toMatch(/^Today, 9:12\sam$/);
    expect(formatDayRelative('2026-10-14T23:30:00', now)).toBe('Yesterday');
    expect(formatDayRelative('2026-10-11T08:00:00', now)).toBe('4 days ago');
    expect(formatDayRelative('2026-09-30T08:00:00', now)).toBe('30 Sept 2026');
  });
});

describe('sanitize', () => {
  it('trims, strips control chars and collapses blank lines', () => {
    expect(cleanText('  hi\u0007\r\n\n\n\nthere  ')).toBe('hi\n\nthere');
    expect(cleanLine('  a \n  b ')).toBe('a b');
  });
});
