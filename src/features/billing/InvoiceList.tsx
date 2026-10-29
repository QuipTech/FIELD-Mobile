import { Download } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { GroupedList, GroupedRow } from '@/components/GroupedList/GroupedList';
import type { PillTone } from '@/components/Pill/Pill';
import { styles } from '@/features/me/styles';
import { colors } from '@/theme';
import { formatBillingMonth, formatCents } from './format';
import type { InvoiceItem } from './types';

const STATUS: Record<string, { label: string; tone: PillTone }> = {
  paid: { label: 'Paid', tone: 'neutral' },
  open: { label: 'Due', tone: 'amber' },
  payment_failed: { label: 'Failed', tone: 'danger' },
  uncollectible: { label: 'Failed', tone: 'danger' },
  void: { label: 'Void', tone: 'neutral' },
  replaced: { label: 'Replaced', tone: 'neutral' },
  refunded: { label: 'Refunded', tone: 'neutral' },
};
const statusOf = (status: string) => STATUS[status] ?? { label: 'Due', tone: 'amber' as const };

/** Month, amount incl. GST (or "Calculating tax…"), status and the PDF. */
export function InvoiceList({
  invoices,
  onOpen,
}: {
  invoices: InvoiceItem[];
  onOpen: (invoice: InvoiceItem) => void;
}) {
  return (
    <GroupedList>
      {invoices.length === 0 && <GroupedRow label="No invoices yet" muted />}
      {invoices.map((invoice) => {
        const month = formatBillingMonth(invoice.periodStart);
        return (
          <GroupedRow
            key={invoice.id}
            label={month}
            value={
              invoice.totalCents === null ? 'Calculating tax…' : formatCents(invoice.totalCents)
            }
            badge={statusOf(invoice.status)}
            trailing={
              invoice.hasPdf ? (
                <Pressable
                  onPress={() => onOpen(invoice)}
                  style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`Download invoice, ${month}`}
                >
                  <Download size={20} color={colors.inkMuted} strokeWidth={2} />
                </Pressable>
              ) : undefined
            }
          />
        );
      })}
    </GroupedList>
  );
}
