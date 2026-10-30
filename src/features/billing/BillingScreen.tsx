import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { useRole } from '@/auth/useRole';
import { toast } from '@/components';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { useAiUsageReport } from '@/features/assistant/usage';
import { AllowanceCard, ManagedPlanCard, PaymentCard } from '@/features/me/BillingCards';
import { useSubscription } from '@/features/me/api';
import { styles } from '@/features/me/styles';
import { InvoiceList } from './InvoiceList';
import { OrganisationSection, SectionTitle } from './OrganisationSection';
import { useOrganisationBilling, useOrganisationInvoices, usePlanChanges } from './organisationApi';
import {
  useBillingPortal,
  useConfirmOnForeground,
  useOpenInvoicePdf,
  usePayInvoice,
  usePayNow,
  usePersonalBilling,
  usePersonalInvoices,
} from './personalApi';
import { PersonalSection } from './PersonalSection';
import { AnnualSheet, CancelSheet } from './PlanSheets';
import { billingErrorMessage, personalCheckoutMode, WEB_BILLING_URL } from './stripeBrowser';

const NONE = { used: 0, limit: 0 };
const onError = (e: unknown) => toast.error(billingErrorMessage(e));

/** Settings → Billing: the user's own fee, their AI usage, and (billing admins) the organisation. */
export function BillingScreen() {
  const { canManageBilling, capabilities } = useRole();
  const personal = usePersonalBilling();
  const paysPersonally =
    !!personal.data && !personal.data.exempt && !personal.data.coveredByOrganisation;
  const invoices = usePersonalInvoices(paysPersonally);
  const payNow = usePayNow();
  const openPdf = useOpenInvoicePdf('personal');
  const payInvoice = usePayInvoice('personal');
  const portal = useBillingPortal('personal');
  const checkout = personalCheckoutMode();
  const usage = useAiUsageReport(capabilities.canUseAi);
  useConfirmOnForeground(!!personal.data?.paymentRequired);

  return (
    <DetailScreen>
      <SectionTitle>Your subscription</SectionTitle>
      <Loaded query={personal}>
        {(status) => (
          <PersonalSection
            status={status}
            checkout={checkout}
            webBillingUrl={WEB_BILLING_URL}
            paying={payNow.isPending}
            payError={payNow.error ? billingErrorMessage(payNow.error) : undefined}
            onPay={(address) => payNow.mutate(address)}
          />
        )}
      </Loaded>

      {paysPersonally && (
        <>
          <SectionTitle>Your invoices</SectionTitle>
          <InvoiceList
            invoices={invoices.data ?? []}
            onOpen={(invoice) => openPdf.mutate(invoice, { onError })}
            // Where personal payments are taken on the web portal, so are invoice payments.
            onPay={
              checkout === 'in-app'
                ? (invoice) => payInvoice.mutate(invoice, { onError })
                : undefined
            }
          />
          {!!invoices.data?.length && (
            <PaymentCard
              payment={{ processor: 'Stripe' }}
              onManage={() => portal.mutate(undefined, { onError })}
            />
          )}
        </>
      )}

      {capabilities.canUseAi && (
        <>
          <SectionTitle>Your AI queries</SectionTitle>
          <AllowanceCard {...(usage.data?.personal ?? NONE)} label="Your AI queries this period" />
        </>
      )}

      {canManageBilling ? <OrganisationBilling /> : <OrganisationPlan />}
    </DetailScreen>
  );
}

/** Everyone sees the organisation's current plan. */
function OrganisationPlan() {
  const plan = useSubscription();
  if (!plan.data) return null;
  return (
    <>
      <SectionTitle>Your organisation</SectionTitle>
      <ManagedPlanCard plan={plan.data} />
    </>
  );
}

function OrganisationBilling() {
  const summary = useOrganisationBilling(true);
  const invoices = useOrganisationInvoices(true);
  const changes = usePlanChanges();
  const openPdf = useOpenInvoicePdf('organisation');
  const payInvoice = usePayInvoice('organisation');
  const portal = useBillingPortal('organisation');
  const [sheet, setSheet] = useState<'annual' | 'cancel' | null>(null);
  const close = () => setSheet(null);
  const busy = changes.nextTerm.isPending || changes.cancel.isPending || changes.keep.isPending;

  return (
    <>
      <SectionTitle>Organisation billing</SectionTitle>
      <Loaded query={summary}>
        {(data) => (
          <>
            <OrganisationSection
              summary={data}
              invoices={invoices.data ?? []}
              busy={busy}
              onChooseNextTerm={(choice) => changes.nextTerm.mutate(choice, { onError })}
              onSwitchToAnnual={() => setSheet('annual')}
              onCancel={() => setSheet('cancel')}
              onKeep={() => changes.keep.mutate(undefined, { onError })}
              onManagePayment={() => portal.mutate(undefined, { onError })}
              onOpenInvoice={(invoice) => openPdf.mutate(invoice, { onError })}
              onPayInvoice={(invoice) => payInvoice.mutate(invoice, { onError })}
            />
            {data.plan && (
              <>
                <AnnualSheet
                  visible={sheet === 'annual'}
                  busy={changes.nextTerm.isPending}
                  onClose={close}
                  suggestedQty={data.thisMonth.activeToday}
                  startsOn={data.plan.currentPeriodEnd}
                  onConfirm={(committedQty) =>
                    changes.nextTerm.mutate(
                      { term: 'annual', committedQty },
                      { onSuccess: close, onError },
                    )
                  }
                />
                <CancelSheet
                  visible={sheet === 'cancel'}
                  busy={changes.cancel.isPending}
                  onClose={close}
                  endsOn={data.plan.currentPeriodEnd}
                  onConfirm={(reason) =>
                    changes.cancel.mutate(reason, { onSuccess: close, onError })
                  }
                />
              </>
            )}
          </>
        )}
      </Loaded>
    </>
  );
}

type QueryLike<T> = {
  data: T | undefined;
  error: unknown;
  isFetching: boolean;
  refetch: () => unknown;
};

function Loaded<T>({ query, children }: { query: QueryLike<T>; children: (data: T) => ReactNode }) {
  if (query.data !== undefined) return <>{children(query.data)}</>;
  if (query.error)
    return (
      <ErrorState error={query.error} onRetry={() => query.refetch()} retrying={query.isFetching} />
    );
  return (
    <View style={styles.card} accessibilityLabel="Loading">
      <Skeleton width="50%" height={20} />
      <Skeleton width="80%" />
    </View>
  );
}
