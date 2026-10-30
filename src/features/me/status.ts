import type { PillTone } from '@/components/Pill/Pill';
import { formatDate } from '@/lib/date';
import type { Plan, PlanStatus } from './data';

export const PLAN_STATUS: Record<PlanStatus, { label: string; tone: PillTone }> = {
  active: { label: 'Active', tone: 'neutral' },
  expiringSoon: { label: 'Ending soon', tone: 'amber' },
  free: { label: 'Free', tone: 'muted' },
  pastDue: { label: 'Past due', tone: 'amber' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

/** "Renews 14 Apr 2027", "Ends 14 Apr 2027", or what applies when there's no date. */
export function planWhen(plan: Plan): string {
  if (plan.status === 'free') return 'No paid plan';
  if (!plan.renewsOn) return 'No end date';
  const ends = plan.status === 'cancelled' || plan.status === 'expiringSoon';
  return `${ends || !plan.renewsAutomatically ? 'Ends' : 'Renews'} ${formatDate(plan.renewsOn)}`;
}
