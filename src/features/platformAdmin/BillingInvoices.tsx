import { ExternalLink } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Avatar } from '@/components/Avatar/Avatar';
import { Chip } from '@/components/Chip/Chip';
import { Pill } from '@/components/Pill/Pill';
import { SearchField } from '@/components/SearchField/SearchField';
import { Text } from '@/components/Text/Text';
import { fontFamily, useTheme } from '@/theme';
import {
  billedTo,
  INVOICE_CATEGORIES,
  type AdminInvoice,
  type InvoiceCategory,
  type InvoiceSummary,
} from './billingApi';
import { CATEGORY, invoiceTotal, openStripeInvoice, shortMonth } from './billingFormat';
import { InvoiceDetail } from './InvoiceDetail';
import { StripeRefreshButton } from './StripeRefreshButton';
import { Loaded, LoadMore, RowCard } from './shared';

function InvoiceRow({
  invoice: i,
  onPress,
  last,
}: {
  invoice: AdminInvoice;
  onPress: () => void;
  last: boolean;
}) {
  const { colors } = useTheme();
  const who = billedTo(i);
  const cat = CATEGORY[i.category];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        gap: 10,
        padding: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: colors.border,
        opacity: pressed ? 0.7 : 1,
      })}
      accessibilityRole="button"
      accessibilityLabel={`${who}, ${shortMonth(i.periodStart)}, ${invoiceTotal(i)}, ${cat.label}`}
    >
      <Avatar name={who} size={36} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: fontFamily.medium }} numberOfLines={1}>
          {who}
        </Text>
        <Text variant="caption" color="muted" numberOfLines={1}>
          {i.kind === 'personal' ? (i.payerEmail ?? 'Technician') : 'Organisation invoice'} ·{' '}
          {shortMonth(i.periodStart)}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          <Pill label={cat.label} tone={cat.tone} />
          {!!i.heldAt && <Pill label="Held" tone="amber" />}
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <Text style={{ fontFamily: fontFamily.medium }}>{invoiceTotal(i)}</Text>
        {i.hostedInvoiceUrl ? (
          <Pressable
            onPress={() => void openStripeInvoice(i.hostedInvoiceUrl!)}
            hitSlop={10}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 32 }}
            accessibilityRole="link"
            accessibilityLabel={`Open ${who}'s invoice in Stripe`}
          >
            <Text variant="caption" color="primary" style={{ textDecorationLine: 'underline' }}>
              Stripe
            </Text>
            <ExternalLink size={13} color={colors.primary} strokeWidth={2} />
          </Pressable>
        ) : (
          <Text variant="caption" color="muted">
            —
          </Text>
        )}
      </View>
    </Pressable>
  );
}

/** Status chips (with counts), search and "Refresh from Stripe", above the invoice list. */
function Controls(props: {
  summary?: InvoiceSummary;
  category: InvoiceCategory | '';
  onCategory: (c: InvoiceCategory | '') => void;
  search: string;
  onSearch: (s: string) => void;
}) {
  const s = props.summary;
  const all = s ? INVOICE_CATEGORIES.reduce((n, c) => n + s[c].count, 0) : undefined;
  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        <Chip
          label="All"
          count={all}
          selected={!props.category}
          onPress={() => props.onCategory('')}
        />
        {INVOICE_CATEGORIES.filter((c) => !s || s[c].count > 0 || props.category === c).map((c) => (
          <Chip
            key={c}
            label={CATEGORY[c].label}
            count={s?.[c].count}
            selected={props.category === c}
            onPress={() => props.onCategory(c)}
          />
        ))}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <SearchField
          style={{ flex: 1 }}
          value={props.search}
          onChange={props.onSearch}
          label="Search user, email or organisation"
        />
        <StripeRefreshButton />
      </View>
    </>
  );
}

export type InvoicesQuery = ReturnType<typeof import('./billingApi').useAdminInvoices>;

/** The invoice list; tap a row for its details. */
export function BillingInvoices(props: {
  query: InvoicesQuery;
  category: InvoiceCategory | '';
  onCategory: (c: InvoiceCategory | '') => void;
  searchText: string;
  onSearchText: (s: string) => void;
}) {
  const { query } = props;
  const [open, setOpen] = useState<AdminInvoice>();
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const filtered = !!props.category || !!props.searchText.trim();
  return (
    <>
      <Controls
        summary={query.data?.pages[0]?.summary}
        category={props.category}
        onCategory={props.onCategory}
        search={props.searchText}
        onSearch={props.onSearchText}
      />
      <Loaded query={query}>
        {() => (
          <RowCard empty={filtered ? 'No invoices match these filters.' : 'No invoices yet.'}>
            {items.map((i, n) => (
              <InvoiceRow
                key={i.id}
                invoice={i}
                onPress={() => setOpen(i)}
                last={n === items.length - 1}
              />
            ))}
          </RowCard>
        )}
      </Loaded>
      <LoadMore
        hasMore={!!query.hasNextPage}
        loading={query.isFetchingNextPage}
        onPress={() => query.fetchNextPage()}
      />
      <InvoiceDetail invoice={open} onClose={() => setOpen(undefined)} />
    </>
  );
}
