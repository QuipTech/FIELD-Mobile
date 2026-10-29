import { useState } from 'react';
import { View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Chip } from '@/components/Chip/Chip';
import { Input } from '@/components/Input/Input';
import { OptionSheet } from '@/components/OptionSheet/OptionSheet';
import { Text } from '@/components/Text/Text';
import {
  AU_STATES,
  validateAddress,
  type AddressDraft,
  type AddressErrors,
  type AuState,
  type BillingAddress,
} from './address';
import { billingStyles } from './styles';

const STATE_OPTIONS = AU_STATES.map((s) => ({ value: s, label: s }));

/** Australian billing address for GST, checked on the device before it's sent. */
export function AddressForm({
  busy,
  initial,
  onSubmit,
}: {
  busy: boolean;
  initial?: BillingAddress;
  onSubmit: (address: BillingAddress) => void;
}) {
  const [draft, setDraft] = useState<AddressDraft>(
    initial ?? { line1: '', city: '', postalCode: '' },
  );
  const [errors, setErrors] = useState<AddressErrors>({});
  const set = (patch: Partial<AddressDraft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setErrors((e) => ({
      ...e,
      ...Object.fromEntries(Object.keys(patch).map((k) => [k, undefined])),
    }));
  };

  const submit = () => {
    const result = validateAddress(draft);
    if ('errors' in result) setErrors(result.errors);
    else onSubmit(result.address);
  };

  return (
    <View style={billingStyles.form}>
      <Text variant="caption" color="inkMuted">
        Your billing address, so GST can be worked out. Card details are entered on Stripe&apos;s
        secure page, never in FIELD.
      </Text>
      <Input
        label="Street address"
        value={draft.line1}
        onChangeText={(line1) => set({ line1 })}
        error={errors.line1}
        autoComplete="street-address"
        textContentType="streetAddressLine1"
        maxLength={200}
      />
      <Input
        label="Suburb or city"
        value={draft.city}
        onChangeText={(city) => set({ city })}
        error={errors.city}
        textContentType="addressCity"
        maxLength={100}
      />
      <View style={billingStyles.formRow}>
        <StateField value={draft.state} error={errors.state} onChange={(state) => set({ state })} />
        <View style={billingStyles.formCell}>
          <Input
            label="Postcode"
            value={draft.postalCode}
            onChangeText={(postalCode) => set({ postalCode: postalCode.replace(/\D/g, '') })}
            error={errors.postalCode}
            keyboardType="number-pad"
            textContentType="postalCode"
            autoComplete="postal-code"
            maxLength={4}
          />
        </View>
      </View>
      <BrandButton label="Continue to payment" onPress={submit} loading={busy} />
    </View>
  );
}

function StateField({
  value,
  error,
  onChange,
}: {
  value: AuState | undefined;
  error?: string;
  onChange: (state: AuState | undefined) => void;
}) {
  const [picking, setPicking] = useState(false);
  return (
    <View style={billingStyles.formCell}>
      <Text variant="label" color="muted">
        State
      </Text>
      <Chip label={value ?? 'Choose'} onPress={() => setPicking(true)} dropdown />
      {error && (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
      <OptionSheet<AuState>
        title={picking ? 'State or territory' : undefined}
        options={STATE_OPTIONS}
        value={value}
        onChange={onChange}
        onClose={() => setPicking(false)}
      />
    </View>
  );
}
