import type { PillTone } from '@/components/Pill/Pill';
import type { MachineRef } from '@/features/machines/data';

export type CasePriority = 'P1' | 'P2' | 'P3';
export type CaseStatus = 'open' | 'resolved';

export type CaseActivity = {
  id: string;
  author: string;
  initials: string;
  /** Written by the signed-in user: shown as "You" with their initials. */
  mine?: boolean;
  /** ISO time. */
  at: string;
  body: string;
  /** Staff-only note. Never rendered for customers (use `visibleActivity`). */
  internal?: boolean;
};

/** `on_track`, `due_soon`, `breached`, `paused`, `met` or `missed`. */
export type CaseSla = { state: string; dueAt?: string; minutesRemaining?: number | null };

export type SupportCase = {
  /** Case number, e.g. "1042". */
  id: string;
  priority: CasePriority;
  status: CaseStatus;
  /** The API's status, e.g. `waiting_on_customer`. */
  rawStatus?: string;
  title: string;
  /** Cases can be raised without a machine. */
  machine?: MachineRef;
  /** One-line state for the list, e.g. "awaiting your reply". */
  summary: string;
  openedAt: string;
  openedBy: string;
  updatedAt: string;
  description: string;
  attachments: { id: string; name: string }[];
  /** Newest first. */
  activity: CaseActivity[];
  /** Who is working the case; null = nobody yet, undefined = not known. Admin only. */
  assignee?: string | null;
  /** The SLA clock is close to breaching or breached. */
  slaBreaching?: boolean;
  sla?: CaseSla;
};

export const PRIORITY_TONE: Record<CasePriority, PillTone> = {
  P1: 'danger',
  P2: 'amber',
  P3: 'muted',
};

export const STATUS_LABEL: Record<CaseStatus, string> = { open: 'Open', resolved: 'Resolved' };

/** Internal notes are staff-only: customers never get them, even if the data has them. */
export const visibleActivity = (activity: CaseActivity[], isAdmin: boolean) =>
  isAdmin ? activity : activity.filter((a) => !a.internal);
