import { z } from 'zod';

import type { MachineRef, MachineStatus } from '@/features/machines/data';
import type { CaseActivity, CasePriority, CaseSla, SupportCase } from './data';

/**
 * Support-case responses (Backend API Reference §3). Item fields beyond the documented ones
 * are read leniently: a missing field falls back instead of failing the whole list.
 */

const person = z
  .object({
    id: z.string().nullish(),
    name: z.string().nullish(),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    email: z.string().nullish(),
  })
  .nullish();
type Person = z.infer<typeof person>;

const caseMachine = z
  .object({
    id: z.string(),
    label: z.string().nullish(),
    fleetNumber: z.string().nullish(),
    assetNumber: z.string().nullish(),
    serialNumber: z.string().nullish(),
    manufacturer: z.string().nullish(),
    model: z.string().nullish(),
    status: z.string().nullish(),
  })
  .nullish();

export const apiSla = z
  .object({
    state: z.string().nullish(),
    dueAt: z.string().nullish(),
    minutesRemaining: z.number().nullish(),
  })
  .nullish();

export const apiCase = z
  .object({
    caseNumber: z.union([z.number(), z.string()]),
    subject: z.string().nullish(),
    title: z.string().nullish(),
    description: z.string().nullish(),
    status: z.string(),
    priority: z.string().nullish(),
    machine: caseMachine,
    createdAt: z.string(),
    updatedAt: z.string().nullish(),
    lastActivityAt: z.string().nullish(),
    createdBy: person,
    assignee: person,
    sla: apiSla,
    attachments: z
      .array(
        z.object({ id: z.string(), fileName: z.string().nullish(), name: z.string().nullish() }),
      )
      .nullish(),
  })
  .loose();
export type ApiCase = z.infer<typeof apiCase>;

export const casePage = z.object({
  items: z.array(apiCase),
  total: z.number(),
  statusCounts: z.record(z.string(), z.number()).nullish(),
});

export const apiMessage = z
  .object({
    id: z.string(),
    body: z.string(),
    createdAt: z.string(),
    isInternal: z.boolean().nullish(),
    isMine: z.boolean().nullish(),
    author: person,
    authorId: z.string().nullish(),
  })
  .loose();
export type ApiMessage = z.infer<typeof apiMessage>;

/** Lists may come bare or wrapped in `{ items }`. */
export const listOf = <T extends z.ZodType>(item: T) =>
  z.union([z.array(item), z.object({ items: z.array(item) }).transform((r) => r.items)]);

const PRIORITIES: CasePriority[] = ['P1', 'P2', 'P3'];
const OPEN = ['new', 'open', 'waiting_on_customer', 'in_progress', 'pending'];

const SUMMARY: Record<string, string> = {
  new: 'waiting for support',
  open: 'with QuipTech support',
  waiting_on_customer: 'awaiting your reply',
  resolved: 'resolved',
  closed: 'closed',
};

const MACHINE_STATUS: Record<string, MachineStatus> = {
  running: 'ok',
  down: 'down',
  service_due: 'due',
};

export const personName = (p: Person, fallback: string) =>
  p?.name || [p?.firstName, p?.lastName].filter(Boolean).join(' ') || p?.email || fallback;

export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

function toMachineRef(m: NonNullable<z.infer<typeof caseMachine>>): MachineRef {
  return {
    id: m.id,
    label: m.fleetNumber || m.label || m.assetNumber || m.serialNumber || 'Machine',
    model: [m.manufacturer, m.model].filter(Boolean).join(' '),
    status: MACHINE_STATUS[m.status ?? ''] ?? 'ok',
  };
}

export function toSla(s: z.infer<typeof apiSla>): CaseSla | undefined {
  if (!s?.state) return undefined;
  return { state: s.state, dueAt: s.dueAt ?? undefined, minutesRemaining: s.minutesRemaining };
}

export function toSupportCase(c: ApiCase): SupportCase {
  const sla = toSla(c.sla);
  return {
    id: String(c.caseNumber),
    priority: PRIORITIES.includes(c.priority as CasePriority) ? (c.priority as CasePriority) : 'P3',
    status: OPEN.includes(c.status) ? 'open' : 'resolved',
    rawStatus: c.status,
    title: c.subject || c.title || `Case #${c.caseNumber}`,
    machine: c.machine ? toMachineRef(c.machine) : undefined,
    summary: SUMMARY[c.status] ?? c.status.replace(/_/g, ' '),
    openedAt: c.createdAt,
    openedBy: personName(c.createdBy, 'you'),
    updatedAt: c.lastActivityAt || c.updatedAt || c.createdAt,
    description: c.description ?? '',
    attachments: (c.attachments ?? []).map((a) => ({
      id: a.id,
      name: a.fileName || a.name || 'Attachment',
    })),
    activity: [],
    assignee: c.assignee === undefined ? undefined : c.assignee ? personName(c.assignee, '') : null,
    sla,
    slaBreaching: sla ? sla.state === 'breached' || sla.state === 'due_soon' : undefined,
  };
}

export function toActivity(m: ApiMessage, myId: string | undefined): CaseActivity {
  const mine = m.isMine ?? (!!myId && (m.authorId ?? m.author?.id) === myId);
  const author = mine ? 'You' : personName(m.author, 'QuipTech support');
  return {
    id: m.id,
    author,
    initials: initialsOf(author),
    mine: mine || undefined,
    at: m.createdAt,
    body: m.body,
    internal: m.isInternal || undefined,
  };
}
