import { useState } from 'react';

import { Segmented } from '@/components/Segmented/Segmented';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { Text } from '@/components/Text/Text';
import { useBillingOrganisations } from './api';
import { useAdminInvoices, type InvoiceCategory } from './billingApi';
import { useDebounced } from '@/lib/useDebounced';
import { BillingInvoices } from './BillingInvoices';
import { BillingOrgs } from './BillingOrgs';
import { BillingStats } from './BillingStats';
import { Loaded, PlatformAdminScreen } from './shared';

type Tab = 'invoices' | 'organisations';

/** Platform billing (portal: Admin › Billing): totals, every invoice, and each organisation. */
export function AdminBilling() {
  const [tab, setTab] = useState<Tab>('invoices');
  const [category, setCategory] = useState<InvoiceCategory | ''>('');
  const [searchText, setSearchText] = useState('');
  const search = useDebounced(searchText);
  const invoices = useAdminInvoices(category, search);
  // The boxes always show every invoice, whatever the filter below.
  const totals = useAdminInvoices('', '');
  const summary = totals.data?.pages[0]?.summary;
  const orgs = useBillingOrganisations();

  return (
    <PlatformAdminScreen>
      {summary ? (
        <BillingStats summary={summary} />
      ) : totals.isPending ? (
        <Skeleton height={104} />
      ) : null}
      <Segmented
        options={[
          { value: 'invoices', label: 'Invoices' },
          { value: 'organisations', label: 'Organisations' },
        ]}
        value={tab}
        onChange={setTab}
        accessibilityLabel="Billing view"
      />
      {tab === 'invoices' ? (
        <BillingInvoices
          query={invoices}
          category={category}
          onCategory={setCategory}
          searchText={searchText}
          onSearchText={setSearchText}
        />
      ) : (
        <Loaded query={orgs}>{() => <BillingOrgs orgs={orgs.data ?? []} />}</Loaded>
      )}
      <Text variant="caption" color="muted">
        Credit notes, price books and account set-up are in the FIELD web portal.
      </Text>
    </PlatformAdminScreen>
  );
}
