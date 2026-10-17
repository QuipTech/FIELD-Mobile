import type { PillTone } from '@/components/Pill/Pill';
import type { InvoiceStatus, PlanStatus } from './data';

export const PLAN_STATUS: Record<PlanStatus, { label: string; tone: PillTone }> = {
  active: { label: 'Active', tone: 'neutral' },
  pastDue: { label: 'Past due', tone: 'amber' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

export const INVOICE_STATUS: Record<InvoiceStatus, { label: string; tone: PillTone }> = {
  paid: { label: 'Paid', tone: 'neutral' },
  due: { label: 'Due', tone: 'amber' },
  failed: { label: 'Failed', tone: 'danger' },
};
