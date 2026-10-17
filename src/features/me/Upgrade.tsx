import { Check, ExternalLink } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { BrandCard } from '@/components/BrandCard/BrandCard';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { colors, fontFamily, spacing } from '@/theme';
import type { PlanOption } from './data';

export type UpgradeProps = {
  plans: PlanOption[];
  onCheckout: (plan: PlanOption) => Promise<void> | void;
};

/** M9C Upgrade plan: pick a plan, then hand off to Stripe checkout. */
export function Upgrade({ plans, onCheckout }: UpgradeProps) {
  const upgradable = plans.filter((p) => !p.current);
  const [selectedId, setSelectedId] = useState(
    () => (upgradable.find((p) => p.recommended) ?? upgradable[0])?.id,
  );
  const [busy, setBusy] = useState(false);
  const selected = upgradable.find((p) => p.id === selectedId);

  const checkout = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await onCheckout(selected);
    } finally {
      setBusy(false);
    }
  };

  return (
    <DetailScreen>
      <View accessibilityRole="radiogroup" style={styles.plans}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            selected={plan.id === selectedId}
            onSelect={() => setSelectedId(plan.id)}
          />
        ))}
      </View>
      <Text variant="caption" color="inkMuted">
        You’ll be redirected to Stripe to confirm payment.
      </Text>
      <BrandButton
        label="Continue to Stripe checkout"
        icon={<ExternalLink size={18} color={colors.onAccent} strokeWidth={2} />}
        onPress={checkout}
        disabled={!selected}
        loading={busy}
      />
    </DetailScreen>
  );
}

function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: PlanOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable
      onPress={onSelect}
      disabled={plan.current}
      style={({ pressed }) => pressed && styles.pressed}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled: !!plan.current }}
      accessibilityLabel={`${plan.name}${plan.current ? ', current plan' : ''}. ${plan.terms}. ${plan.features.join(', ')}`}
    >
      <BrandCard highlighted={selected}>
        <View style={styles.head}>
          <Text style={styles.name}>{plan.name}</Text>
          {plan.current && <Pill label="Current plan" tone="muted" />}
          {!plan.current && plan.recommended && <Pill label="Recommended" tone="brand" />}
        </View>
        <Text variant="caption" color="inkMuted">
          {plan.terms}
        </Text>
        <View style={styles.features}>
          {plan.features.map((f) => (
            <View key={f} style={styles.feature}>
              <Check
                size={16}
                color={selected ? colors.brand : colors.inkMuted}
                strokeWidth={2.5}
              />
              <Text color="inkMuted" style={styles.featureText}>
                {f}
              </Text>
            </View>
          ))}
        </View>
      </BrandCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  plans: { gap: 14 },
  pressed: { opacity: 0.85 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontFamily: fontFamily.medium, fontSize: 17, lineHeight: 22 },
  features: { gap: 6, marginTop: spacing.xxs },
  feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  featureText: { flex: 1, fontSize: 15, lineHeight: 20 },
});
