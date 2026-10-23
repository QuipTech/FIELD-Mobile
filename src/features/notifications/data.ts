import {
  ClipboardList,
  ClockAlert,
  Download,
  FileX,
  LifeBuoy,
  Sparkles,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';

import type { MachineRef } from '@/features/machines/data';
import { colors } from '@/theme';

export type NotificationKind =
  | 'machineDown'
  | 'caseUpdate'
  | 'serviceDue'
  | 'manualUpdate'
  | 'slaRisk'
  | 'indexFailed'
  | 'aiReview'
  | 'alert';

/** Kinds only admins receive: they act on the whole account, not one technician's work. */
export const ADMIN_KINDS: readonly NotificationKind[] = ['slaRisk', 'indexFailed', 'aiReview'];

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
  /** Machine this is about when only its id is known. */
  machineId?: string;
  /** Support case this is about, e.g. "1042". */
  caseId?: string;
  unread: boolean;
};

export const KIND_STYLE: Record<NotificationKind, { icon: LucideIcon; fg: string; bg: string }> = {
  machineDown: { icon: TriangleAlert, fg: colors.danger, bg: colors.dangerTint },
  caseUpdate: { icon: LifeBuoy, fg: colors.ink, bg: colors.fill },
  serviceDue: { icon: ClipboardList, fg: colors.amber, bg: colors.amberTint },
  manualUpdate: { icon: Download, fg: colors.ink, bg: colors.fill },
  slaRisk: { icon: ClockAlert, fg: colors.amber, bg: colors.amberTint },
  indexFailed: { icon: FileX, fg: colors.danger, bg: colors.dangerTint },
  aiReview: { icon: Sparkles, fg: colors.ink, bg: colors.fill },
  alert: { icon: TriangleAlert, fg: colors.amber, bg: colors.amberTint },
};
