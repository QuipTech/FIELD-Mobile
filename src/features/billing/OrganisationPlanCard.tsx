import { Pressable, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { styles } from '@/features/me/styles';
import { formatBillingDay } from './format';
import type { NextTerm } from './organisationApi';
import { billingStyles } from './styles';
import type { OrganisationPlan } from './types';

export type PlanActions = {
  busy: boolean;
  onChooseNextTerm: (choice: NextTerm) => void;
  onSwitchToAnnual: () => void;
  onCancel: () => void;
  onKeep: () => void;
};

const describeTerm = (plan: OrganisationPlan) =>
  plan.term === 'annual'
    ? `Annual prepaid for ${plan.committedQty ?? 0} machines, ${formatBillingDay(plan.currentPeriodStart)} to ${formatBillingDay(plan.currentPeriodEnd)}`
    : 'Monthly, billed in arrears on the 1st. No lock-in.';

/** The plan and the changes the organisation can make itself; all apply at the next renewal. */
export function OrganisationPlanCard({
  plan,
  ...actions
}: { plan: OrganisationPlan } & PlanActions) {
  const selfServe = plan.planCode === 'ASSET_PRO';
  const cancelling = plan.status === 'cancelling';
  // Undo puts the current term back as the next one.
  const undo: NextTerm =
    plan.term === 'annual'
      ? { term: 'annual', committedQty: plan.committedQty ?? 1 }
      : { term: 'monthly' };

  return (
    <View style={styles.card}>
      <View style={styles.splitRow}>
        <Text style={styles.planTitle} accessibilityRole="header">
          {plan.planName}
        </Text>
        <Pill
          label={
            cancelling && plan.cancelAt
              ? `Ends ${formatBillingDay(plan.cancelAt)}`
              : plan.term === 'annual'
                ? 'Annual'
                : 'Monthly'
          }
          tone={cancelling ? 'amber' : 'brand'}
        />
      </View>
      <Text variant="caption" color="inkMuted">
        {describeTerm(plan)}
      </Text>
      {plan.planCode === 'ENTERPRISE' && (
        <Text variant="caption" color="inkMuted">
          Your Enterprise contract is quoted; contact QuipTech to change it.
        </Text>
      )}
      {cancelling && plan.exportUntil && (
        <Text variant="caption" color="inkMuted">
          Your data can be exported until {formatBillingDay(plan.exportUntil)}.
        </Text>
      )}

      {plan.nextTerm && !cancelling && (
        <View style={billingStyles.nextTerm}>
          <Text variant="caption" style={{ flex: 1 }}>
            From {formatBillingDay(plan.currentPeriodEnd)}:{' '}
            {plan.nextTerm === 'annual'
              ? `annual prepaid for ${plan.nextCommittedQty ?? 0} machines`
              : 'monthly billing'}
            .
          </Text>
          <Pressable
            onPress={() => actions.onChooseNextTerm(undo)}
            disabled={actions.busy}
            accessibilityRole="button"
            accessibilityLabel="Undo next term change"
            hitSlop={8}
          >
            <Text variant="caption" color="brand">
              Undo
            </Text>
          </Pressable>
        </View>
      )}

      {selfServe && <PlanButtons plan={plan} {...actions} />}
    </View>
  );
}

/** Self-serve (Asset Pro) changes: annual or monthly from renewal, cancel, or keep. */
function PlanButtons({ plan, ...actions }: { plan: OrganisationPlan } & PlanActions) {
  if (plan.status === 'cancelling')
    return (
      <View style={billingStyles.actions}>
        <BrandButton label="Keep my plan" onPress={actions.onKeep} loading={actions.busy} />
      </View>
    );
  return (
    <View style={billingStyles.actions}>
      {plan.term === 'monthly' && !plan.nextTerm && (
        <BrandButton
          label="Switch to annual (2 months free)"
          onPress={actions.onSwitchToAnnual}
          disabled={actions.busy}
        />
      )}
      {plan.term === 'annual' && !plan.nextTerm && (
        <BrandButton
          label="Go monthly at renewal"
          variant="outline"
          onPress={() => actions.onChooseNextTerm({ term: 'monthly' })}
          loading={actions.busy}
        />
      )}
      <BrandButton
        label="Cancel plan"
        variant="outline"
        onPress={actions.onCancel}
        disabled={actions.busy}
      />
    </View>
  );
}
