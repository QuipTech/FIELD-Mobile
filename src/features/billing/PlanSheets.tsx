import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View, type TextInputProps } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { useStyles as useInputStyles } from '@/components/Input/styles';
import { Sheet } from '@/components/Sheet/Sheet';
import { Text } from '@/components/Text/Text';
import { errorMessage } from '@/lib/http';
import { layout, useTheme } from '@/theme';
import { formatBillingDay, formatCents } from './format';
import { useAnnualQuote } from './organisationApi';
import { billingStyles } from './styles';

const QUOTE_DELAY_MS = 300;
const MAX_QTY = 100_000;

type SheetProps = { visible: boolean; busy: boolean; onClose: () => void };

/**
 * Annual prepaid: commit to Q machines for 12 months from the next renewal and pay for 10 months
 * up front. Months above Q add only the difference.
 */
export function AnnualSheet({
  visible,
  busy,
  onClose,
  suggestedQty,
  startsOn,
  onConfirm,
}: SheetProps & { suggestedQty: number; startsOn: string; onConfirm: (qty: number) => void }) {
  const [text, setText] = useState(String(Math.max(suggestedQty, 1)));
  const [qty, setQty] = useState<number | null>(null);
  const parsed = Number(text);
  const valid = /^\d+$/.test(text) && parsed >= 1 && parsed <= MAX_QTY;

  useEffect(() => {
    const timer = setTimeout(() => setQty(valid && visible ? parsed : null), QUOTE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [parsed, valid, visible]);
  const quote = useAnnualQuote(qty);
  const priced = quote.data && quote.data.committedQty === parsed ? quote.data : undefined;

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Switch to annual prepaid"
      footer={
        <BrandButton
          label="Switch at renewal"
          onPress={() => onConfirm(parsed)}
          disabled={!valid || !priced}
          loading={busy}
        />
      }
    >
      <View style={billingStyles.sheetBody}>
        <Text variant="caption" color="inkMuted">
          Commit to a number of machines for 12 months from {formatBillingDay(startsOn)} and pay for
          10 of them up front: two months free. In a month with more active machines than you
          committed to, only the difference is added. There is no refund for months below it.
        </Text>
        <SheetField
          label="Machines to commit to"
          value={text}
          onChangeText={(t) => setText(t.replace(/\D/g, ''))}
          keyboardType="number-pad"
          error={valid ? undefined : `Enter 1 to ${MAX_QTY.toLocaleString('en-AU')}`}
        />
        {valid && quote.isFetching && !priced && <ActivityIndicator />}
        {quote.error && (
          <Text variant="caption" color="danger">
            {errorMessage(quote.error)}
          </Text>
        )}
        {priced && (
          <Text variant="caption" accessibilityLiveRegion="polite">
            {formatCents(priced.monthlyPriceCents)} a month · {formatCents(priced.upFrontCents)} up
            front, ex GST
          </Text>
        )}
      </View>
    </Sheet>
  );
}

/** Ends the plan at the end of the current term; it can be kept until then. */
export function CancelSheet({
  visible,
  busy,
  onClose,
  endsOn,
  onConfirm,
}: SheetProps & { endsOn: string; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('');
  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Cancel your FIELD plan"
      footer={
        <BrandButton
          label="Cancel at end of term"
          onPress={() => onConfirm(reason.trim())}
          disabled={reason.trim().length === 0}
          loading={busy}
        />
      }
    >
      <View style={billingStyles.sheetBody}>
        <Text variant="caption" color="inkMuted">
          Your plan keeps running until {formatBillingDay(endsOn)} and this term is billed as usual.
          After that, full machine history, adding machines and new AI sessions stop. Your data
          stays available to export for 30 days. You can keep the plan any time before it ends.
        </Text>
        <SheetField
          label="Why are you cancelling?"
          value={reason}
          onChangeText={setReason}
          multiline
          maxLength={500}
        />
      </View>
    </Sheet>
  );
}

/** `Input`'s look, on the bottom sheet's keyboard-aware text input. */
function SheetField({ label, error, ...rest }: TextInputProps & { label: string; error?: string }) {
  const styles = useInputStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.wrapper}>
      <Text variant="label" color="muted">
        {label}
      </Text>
      <View style={[styles.field, !!error && styles.error]}>
        <BottomSheetTextInput
          accessibilityLabel={label}
          placeholderTextColor={colors.faint}
          selectionColor={colors.primary}
          maxFontSizeMultiplier={layout.maxFontScale}
          style={[styles.input, rest.multiline && styles.multiline]}
          {...rest}
        />
      </View>
      {error && (
        <Text variant="caption" color="danger">
          {error}
        </Text>
      )}
    </View>
  );
}
