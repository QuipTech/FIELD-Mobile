import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { ModalSheet } from '@/components/ModalSheet/ModalSheet';
import { SearchField } from '@/components/SearchField/SearchField';
import { Segmented } from '@/components/Segmented/Segmented';
import { Text } from '@/components/Text/Text';
import { errorMessage } from '@/lib/http';
import { makeStyles, useTheme } from '@/theme';
import { useAdminUsers, useBillingOrganisations } from '../api';
import type { AccessLevel, TargetType } from './groupsApi';

const LIMIT = 30;
type Target = { id: string; name: string; detail?: string };

/** Organisations (from billing) or people (from Users), filtered on device. */
function useTargets(type: TargetType, q: string) {
  const orgs = useBillingOrganisations();
  const users = useAdminUsers();
  const query = type === 'organisation' ? orgs : users;
  const all: Target[] =
    type === 'organisation'
      ? (orgs.data ?? []).filter((o) => o.key).map((o) => ({ id: o.key, name: o.displayName }))
      : (users.data ?? []).map((u) => ({
          id: u.id,
          name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email,
          detail: [u.email, u.organisation?.name].filter(Boolean).join(' · '),
        }));
  const s = q.trim().toLowerCase();
  const matching = all.filter((t) => !s || `${t.name} ${t.detail ?? ''}`.toLowerCase().includes(s));
  return { matching, loading: query.isPending, error: query.error };
}

function TargetList({
  type,
  matching,
  loading,
  selected,
  existing,
  onPick,
}: {
  type: TargetType;
  matching: Target[];
  loading: boolean;
  selected?: string;
  existing: Set<string>;
  onPick: (t: Target) => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <>
      {loading ? (
        <ActivityIndicator />
      ) : (
        matching.slice(0, LIMIT).map((t) => {
          const isSelected = selected === t.id;
          const already = existing.has(`${type}:${t.id}`);
          return (
            <Pressable
              key={t.id}
              onPress={() => onPick(t)}
              style={[styles.option, isSelected && styles.selected]}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
            >
              <View style={{ flex: 1 }}>
                <Text numberOfLines={1}>{t.name}</Text>
                {!!(t.detail || already) && (
                  <Text variant="caption" color="muted" numberOfLines={1}>
                    {already ? 'Already shared: this changes their access' : t.detail}
                  </Text>
                )}
              </View>
              {isSelected && <Check size={18} color={colors.primary} strokeWidth={2.5} />}
            </Pressable>
          );
        })
      )}
      {matching.length > LIMIT && (
        <Text variant="caption" color="muted">
          Showing {LIMIT} of {matching.length}. Type to narrow the list.
        </Text>
      )}{' '}
    </>
  );
}

type ShareSheetProps = {
  visible: boolean;
  existing: Set<string>;
  onClose: () => void;
  onShare: (body: {
    targetType: TargetType;
    targetId: string;
    accessLevel: AccessLevel;
  }) => Promise<unknown>;
};

/** Share: pick organisation or person, then who, then view or contribute. Mounted while open. */
export function ShareSheet(props: ShareSheetProps) {
  return props.visible ? <OpenShareSheet {...props} /> : null;
}

const TYPES = [
  { value: 'organisation' as const, label: 'Organisation' },
  { value: 'user' as const, label: 'Person' },
];
const LEVELS = [
  { value: 'view' as const, label: 'View' },
  { value: 'contribute' as const, label: 'Contribute' },
];

function OpenShareSheet(props: ShareSheetProps) {
  const [type, setType] = useState<TargetType>('organisation');
  const [q, setQ] = useState('');
  const [target, setTarget] = useState<Target>();
  const [level, setLevel] = useState<AccessLevel>('view');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const { matching, loading } = useTargets(type, q);

  const share = async () => {
    if (!target) return;
    setBusy(true);
    setError(undefined);
    try {
      await props.onShare({ targetType: type, targetId: target.id, accessLevel: level });
      props.onClose();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalSheet
      visible
      title="Share group"
      onClose={props.onClose}
      busy={busy}
      footer={
        <Button
          label={target ? `Share with ${target.name}` : 'Choose who to share with'}
          onPress={() => void share()}
          disabled={!target}
          loading={busy}
        />
      }
    >
      <Segmented
        options={TYPES}
        value={type}
        onChange={(t) => {
          setType(t);
          setTarget(undefined);
        }}
        accessibilityLabel="Share with"
      />
      <SearchField
        value={q}
        onChange={setQ}
        label={type === 'user' ? 'Search people' : 'Search organisations'}
      />
      <TargetList
        type={type}
        matching={matching}
        loading={loading}
        selected={target?.id}
        existing={props.existing}
        onPick={setTarget}
      />
      <Text variant="label" color="muted">
        Access
      </Text>
      <Segmented
        options={LEVELS}
        value={level}
        onChange={setLevel}
        accessibilityLabel="Access level"
      />
      {!!error && <Text color="danger">{error}</Text>}
    </ModalSheet>
  );
}

const useStyles = makeStyles((c) => ({
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  selected: { backgroundColor: c.primaryTint },
}));
