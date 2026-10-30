import { useState } from 'react';
import { View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Chip } from '@/components/Chip/Chip';
import { Input } from '@/components/Input/Input';
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
      <StateField value={draft.state} error={errors.state} onChange={(state) => set({ state })} />
      <View style={billingStyles.postcode}>
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
      <BrandButton label="Continue to payment" onPress={submit} loading={busy} />
    </View>
  );
}

/**
 * All eight states and territories as chips. Inline rather than a bottom sheet: the form also
 * sits in the Payment required popup, a native modal that would cover a sheet.
 */
function StateField({
  value,
  error,
  onChange,
}: {
  value: AuState | undefined;
  error?: string;
  onChange: (state: AuState) => void;
}) {
  return (
    <View style={billingStyles.formCell} accessibilityRole="radiogroup" accessibilityLabel="State">
      <Text variant="label" color="muted">
        State or territory
      </Text>
      <View style={billingStyles.stateChips}>
        {AU_STATES.map((state) => (
          <Chip
            key={state}
            label={state}
            selected={state === value}
            onPress={() => onChange(state)}
          />
        ))}
      </View>
      {error && (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}
