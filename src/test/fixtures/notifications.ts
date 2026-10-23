import type { AppNotification } from '@/features/notifications/data';
import { SAMPLE_MACHINES } from '@/test/fixtures/machines/fleet';

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

/** The M12 design's feed, for tests and previews. */
export const SAMPLE_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n-sla-1043',
    kind: 'slaRisk',
    title: 'Case #1043 close to SLA breach',
    summary: '25 min left · unassigned',
    at: ago(4),
    body: 'Case #1043 has 25 minutes left on its response SLA and nobody is assigned. Assign it to keep within the agreed response time.',
    caseId: '1043',
    unread: true,
  },
  {
    id: 'n-2204',
    kind: 'machineDown',
    title: 'HT-2201 flagged Down',
    summary: 'Brake pressure alarm',
    at: ago(8),
    body: 'A brake pressure alarm (E-2204) tripped on HT-2201 at Bench 3 and did not clear on restart. The machine has been auto-flagged Down and an open case has been raised.',
    machine: SAMPLE_MACHINES['HT-2201'],
    caseId: '1042',
    unread: true,
  },
  {
    id: 'n-1038',
    kind: 'caseUpdate',
    title: 'Case #1038 was updated',
    summary: 'QuipTech support replied',
    at: ago(60),
    body: 'QuipTech support replied to your case about the hydraulic whine on LD-0904: they would like a short video of the noise at full lift.',
    machine: SAMPLE_MACHINES['LD-0904'],
    caseId: '1038',
    unread: true,
  },
  {
    id: 'n-0904',
    kind: 'serviceDue',
    title: 'LD-0904 service due',
    summary: '1,000 h service overdue by 210 h',
    at: ago(3 * 60),
    body: 'LD-0904 has run 210 hours past its 1,000 h service interval. Book the service with your site coordinator.',
    machine: SAMPLE_MACHINES['LD-0904'],
    unread: false,
  },
  {
    id: 'n-b88',
    kind: 'manualUpdate',
    title: 'Manual update available',
    summary: 'Bulletin 88 revises charge pressure',
    at: ago(26 * 60),
    body: 'Service bulletin 88 revises the brake accumulator charge pressure procedure. Download the updated manual for offline use before your next shift.',
    unread: false,
  },
  {
    id: 'n-idx-hd785',
    kind: 'indexFailed',
    title: 'Document failed to index',
    summary: 'HD785 Shop Manual · needs OCR',
    at: ago(30 * 60),
    body: 'The HD785 Shop Manual has scanned pages with no text layer, so FIELD AI cannot search it. Re-upload a text PDF or run OCR from the FIELD console.',
    unread: false,
  },
];
