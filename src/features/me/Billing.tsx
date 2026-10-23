import { Download } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { GroupedList, GroupedRow } from '@/components/GroupedList/GroupedList';
import { Text } from '@/components/Text/Text';
import { formatDate } from '@/lib/date';
import { colors } from '@/theme';
import { AllowanceCard, ManagedPlanCard, PaymentCard, PlanOverview } from './BillingCards';
import type { BillingData, Invoice } from './data';
import { INVOICE_STATUS } from './status';
import { styles } from './styles';

export type BillingProps = {
  data: BillingData;
  /** Admins manage billing; technicians see the plan and their own usage, read-only. */
  isAdmin: boolean;
  onManagePayment: () => void;
  onDownloadInvoice: (invoice: Invoice) => void;
};

/** M9B Billing & subscription. The white header comes from the stack (see app/_layout). */
export function Billing({ data, isAdmin, onManagePayment, onDownloadInvoice }: BillingProps) {
  if (!isAdmin) {
    return (
      <DetailScreen>
        {data.plan && <ManagedPlanCard plan={data.plan} />}
        <SectionTitle>Your AI queries</SectionTitle>
        <AllowanceCard {...data.personalAllowance} label="Your AI queries this period" />
      </DetailScreen>
    );
  }

  return (
    <DetailScreen>
      {data.plan && <PlanOverview plan={data.plan} />}

      <SectionTitle>AI query allowance</SectionTitle>
      <AllowanceCard {...data.allowance} />

      <SectionTitle>Add-ons</SectionTitle>
      <GroupedList>
        {data.addOns.length === 0 && <GroupedRow label="No add-ons on this plan" muted />}
        {data.addOns.map((addOn) => (
          <GroupedRow
            key={addOn.id}
            label={addOn.label}
            badge={{ label: String(addOn.count), tone: 'brand' }}
          />
        ))}
      </GroupedList>

      <SectionTitle>Payment method</SectionTitle>
      <PaymentCard payment={data.payment} onManage={onManagePayment} />

      <SectionTitle>Invoices</SectionTitle>
      <GroupedList>
        {data.invoices.length === 0 && <GroupedRow label="No invoices yet" muted />}
        {data.invoices.map((invoice) => (
          <InvoiceRow key={invoice.id} invoice={invoice} onDownload={onDownloadInvoice} />
        ))}
      </GroupedList>
    </DetailScreen>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={styles.sectionTitle} accessibilityRole="header">
      {children}
    </Text>
  );
}

function InvoiceRow({
  invoice,
  onDownload,
}: {
  invoice: Invoice;
  onDownload: (invoice: Invoice) => void;
}) {
  const date = formatDate(invoice.issuedOn);
  return (
    <GroupedRow
      label={date}
      badge={INVOICE_STATUS[invoice.status]}
      trailing={
        <Pressable
          onPress={() => onDownload(invoice)}
          style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel={`Download invoice, ${date}`}
        >
          <Download size={20} color={colors.inkMuted} strokeWidth={2} />
        </Pressable>
      }
    />
  );
}
