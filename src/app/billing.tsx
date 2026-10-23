import { useRole } from '@/auth/useRole';
import { toast } from '@/components';
import { useAiUsageReport } from '@/features/assistant/usage';
import { useBillingPortal, useInvoices, useOpenInvoice, useSubscription } from '@/features/me/api';
import { Billing } from '@/features/me/Billing';
import type { BillingData } from '@/features/me/data';
import { errorMessage } from '@/lib/http';

const NONE = { used: 0, limit: 0 };

export default function BillingRoute() {
  const { canManageBilling, capabilities } = useRole();
  const plan = useSubscription();
  const usage = useAiUsageReport(capabilities.canUseAi);
  const invoices = useInvoices(canManageBilling);
  const openInvoice = useOpenInvoice(canManageBilling);
  const portal = useBillingPortal(canManageBilling);

  const data: BillingData = {
    plan: plan.data,
    allowance: usage.data?.organisation ?? NONE,
    personalAllowance: usage.data?.personal ?? NONE,
    addOns: [],
    payment: { processor: 'Stripe' },
    invoices: invoices.data ?? [],
  };
  const onError = (e: unknown) => toast.show(errorMessage(e));

  return (
    <Billing
      data={data}
      isAdmin={canManageBilling}
      onManagePayment={() => portal.mutate(undefined, { onError })}
      onDownloadInvoice={(invoice) => openInvoice.mutate(invoice, { onError })}
    />
  );
}
