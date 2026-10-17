import {
  ClipboardList,
  Download,
  LifeBuoy,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';
import { create } from 'zustand';

import { SAMPLE_MACHINES, type MachineRef } from '@/features/machines/data';
import { colors } from '@/theme';

export type NotificationKind = 'machineDown' | 'caseUpdate' | 'serviceDue' | 'manualUpdate';

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  /** One line under the title, e.g. "Brake pressure alarm". */
  summary: string;
  /** ISO time. */
  at: string;
  body: string;
  machine?: MachineRef;
  /** Support case this is about, e.g. "1042". */
  caseId?: string;
  unread: boolean;
};

export const KIND_STYLE: Record<NotificationKind, { icon: LucideIcon; fg: string; bg: string }> = {
  machineDown: { icon: TriangleAlert, fg: colors.danger, bg: colors.dangerTint },
  caseUpdate: { icon: LifeBuoy, fg: colors.ink, bg: colors.fill },
  serviceDue: { icon: ClipboardList, fg: colors.amber, bg: colors.amberTint },
  manualUpdate: { icon: Download, fg: colors.ink, bg: colors.fill },
};

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

/** TODO(api): the M12 design's sample feed until the notifications endpoint and push exist. */
const SAMPLE: AppNotification[] = [
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
];

type ReadState = {
  /** Ids read on this device since launch. TODO(api): persist read state on the server. */
  read: Record<string, true>;
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
};

export const useReadState = create<ReadState>((set) => ({
  read: {},
  markRead: (id) => set((s) => ({ read: { ...s.read, [id]: true } })),
  markAllRead: (ids) =>
    set((s) => ({ read: { ...s.read, ...Object.fromEntries(ids.map((id) => [id, true])) } })),
}));

export function useNotifications(): AppNotification[] {
  const read = useReadState((s) => s.read);
  return SAMPLE.map((n) => ({ ...n, unread: n.unread && !read[n.id] }));
}
