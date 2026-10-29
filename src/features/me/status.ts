import type { PillTone } from '@/components/Pill/Pill';
import type { PlanStatus } from './data';

export const PLAN_STATUS: Record<PlanStatus, { label: string; tone: PillTone }> = {
  active: { label: 'Active', tone: 'neutral' },
  pastDue: { label: 'Past due', tone: 'amber' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};
