import { Download } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { GroupedList, GroupedRow } from '@/components/GroupedList/GroupedList';
import type { PillTone } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { styles } from '@/features/me/styles';
import { colors } from '@/theme';
import { formatBillingMonth, formatCents } from './format';
import { billingStyles } from './styles';
import type { InvoiceItem } from './types';

// FIELD invoice statuses, worded as on the portal.
const STATUS: Record<string, { label: string; tone: PillTone }> = {
  paid: { label: 'Paid', tone: 'neutral' },
  synced: { label: 'Due', tone: 'amber' },
  open: { label: 'Due', tone: 'amber' },
  draft: { label: 'Being prepared', tone: 'brand' },
  final: { label: 'Being prepared', tone: 'brand' },
  payment_failed: { label: 'Payment failed', tone: 'danger' },
  uncollectible: { label: 'Payment failed', tone: 'danger' },
  void: { label: 'Void', tone: 'neutral' },
  replaced: { label: 'Replaced', tone: 'neutral' },
  refunded: { label: 'Refunded', tone: 'neutral' },
};
const statusOf = (status: string) =>
  STATUS[status] ?? { label: status.replaceAll('_', ' '), tone: 'neutral' as const };

/** "A$53.90", "A$53.90 · A$20.00 paid" when part-paid, or "Calculating tax…". */
function amountOf({ totalCents, paidCents }: InvoiceItem): string {
  if (totalCents === null) return 'Calculating tax…';
  const partPaid = paidCents !== null && paidCents > 0 && paidCents < totalCents;
  return partPaid
    ? `${formatCents(totalCents)} · ${formatCents(paidCents)} paid`
    : formatCents(totalCents);
}

/** Month, amount incl. GST, status, and Pay (when still due) and PDF actions. */
export function InvoiceList({
  invoices,
  onOpen,
  onPay,
}: {
  invoices: InvoiceItem[];
  onOpen: (invoice: InvoiceItem) => void;
  /** Omit to hide Pay, e.g. where personal payments are taken on the web portal. */
  onPay?: (invoice: InvoiceItem) => void;
}) {
  return (
    <GroupedList>
      {invoices.length === 0 && <GroupedRow label="No invoices yet" muted />}
      {invoices.map((invoice) => {
        const month = formatBillingMonth(invoice.periodStart);
        const canPay = !!onPay && !!invoice.payUrl;
        return (
          <GroupedRow
            key={invoice.id}
            label={month}
            value={amountOf(invoice)}
            badge={statusOf(invoice.status)}
            trailing={
              canPay || invoice.hasPdf ? (
                <View style={billingStyles.invoiceActions}>
                  {canPay && (
                    <Pressable
                      onPress={() => onPay(invoice)}
                      style={({ pressed }) => [
                        billingStyles.payButton,
                        pressed && styles.iconButtonPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Pay invoice, ${month}`}
                      hitSlop={6}
                    >
                      <Text variant="caption" color="onAccent">
                        Pay
                      </Text>
                    </Pressable>
                  )}
                  {invoice.hasPdf && (
                    <Pressable
                      onPress={() => onOpen(invoice)}
                      style={({ pressed }) => [
                        styles.iconButton,
                        pressed && styles.iconButtonPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`Download invoice, ${month}`}
                    >
                      <Download size={20} color={colors.inkMuted} strokeWidth={2} />
                    </Pressable>
                  )}
                </View>
              ) : undefined
            }
          />
        );
      })}
    </GroupedList>
  );
}
