import { toast } from '@/components';
import { Billing } from '@/features/me/Billing';
import { useBillingData } from '@/features/me/data';

/** TODO(api): Manage opens the Stripe customer portal and invoices download as PDFs. */
export default function BillingRoute() {
  const { data, isSample } = useBillingData();
  return (
    <Billing
      data={data}
      isSample={isSample}
      onManagePayment={() => toast.show('Managing payment methods is coming soon.')}
      onDownloadInvoice={() => toast.show('Invoice downloads are coming soon.')}
    />
  );
}
