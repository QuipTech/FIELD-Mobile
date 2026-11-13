import { useState } from 'react';
import { View } from 'react-native';

import { ListRow } from '@/components/ListRow/ListRow';
import { ModalSheet } from '@/components/ModalSheet/ModalSheet';
import { Pill } from '@/components/Pill/Pill';
import { formatBillingDay } from '@/features/billing/format';
import type { BillingOrg } from './api';
import { Field, RowCard } from './shared';

const PLANS: Record<string, string> = {
  ASSET_PRO: 'Asset Professional',
  ENTERPRISE: 'Enterprise',
  INTERNAL: 'Internal',
  TECH: 'Technician',
};

const planName = (o: BillingOrg) =>
  o.plan ? (PLANS[o.plan.planCode] ?? o.plan.planCode) : 'No plan';

function planLabel(o: BillingOrg) {
  if (!o.plan) return 'No plan';
  const term = o.plan.term === 'annual' ? `annual, ${o.plan.committedQty ?? 0}` : 'monthly';
  return `${planName(o)} · ${term}`;
}

function Status({ org }: { org: BillingOrg }) {
  const account = org.billingAccount;
  const pills = [
    account?.suspendedAt && <Pill key="s" label="Suspended" tone="danger" />,
    org.overdueInvoiceCount > 0 && (
      <Pill key="o" label={`${org.overdueInvoiceCount} overdue`} tone="amber" />
    ),
    org.usageFlagged && <Pill key="u" label="Over allowance" tone="danger" />,
    org.plan?.status === 'cancelling' && <Pill key="c" label="Ending" tone="amber" />,
  ].filter(Boolean);
  if (pills.length) return <View style={{ gap: 4, alignItems: 'flex-end' }}>{pills}</View>;
  if (!account) return <Pill label="Not set up" />;
  return (
    <Pill
      label={account.stripeCustomerId ? 'Up to date' : 'Stripe not linked'}
      tone={account.stripeCustomerId ? 'success' : 'neutral'}
    />
  );
}

function OrgDetail({ org: o, onClose }: { org?: BillingOrg; onClose: () => void }) {
  const a = o?.billingAccount;
  return (
    <ModalSheet visible={!!o} title={o?.displayName ?? ''} onClose={onClose}>
      {o && (
        <>
          <Status org={o} />
          <Field label="Plan" value={planName(o)} />
          <Field
            label="Term"
            value={o.plan?.term === 'annual' ? 'Annual prepaid' : o.plan ? 'Monthly' : null}
          />
          {o.plan?.term === 'annual' && (
            <Field label="Committed machines" value={String(o.plan.committedQty ?? 0)} />
          )}
          <Field label="Plan status" value={o.plan?.status} />
          <Field label="Billing account" value={a ? (a.accountName ?? 'Set up') : 'Not set up'} />
          <Field
            label="Stripe"
            value={a ? (a.stripeCustomerId ? `Linked (${a.stripeCustomerId})` : 'Not linked') : '—'}
          />
          <Field label="Overdue invoices" value={String(o.overdueInvoiceCount)} />
          <Field label="Usage" value={o.usageFlagged ? 'Over allowance' : 'Within allowance'} />
          {a?.suspendedAt && <Field label="Suspended" value={formatBillingDay(a.suspendedAt)} />}
        </>
      )}
    </ModalSheet>
  );
}

/** Each organisation's plan and payment health; tap for details. */
export function BillingOrgs({ orgs }: { orgs: BillingOrg[] }) {
  const [open, setOpen] = useState<BillingOrg>();
  return (
    <>
      <RowCard empty="No organisations yet.">
        {orgs.map((o, i) => (
          <ListRow
            key={`${o.key}-${i}`}
            title={o.displayName}
            subtitle={planLabel(o)}
            trailing={<Status org={o} />}
            onPress={() => setOpen(o)}
            last={i === orgs.length - 1}
          />
        ))}
      </RowCard>
      <OrgDetail org={open} onClose={() => setOpen(undefined)} />
    </>
  );
}
