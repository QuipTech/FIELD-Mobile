import * as Clipboard from 'expo-clipboard';
import { Copy, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/Card/Card';
import { IconButton } from '@/components/Button/IconButton';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { formatHours } from '@/lib/format';
import { fontFamily, makeStyles } from '@/theme';
import type { Machine } from './data';

async function copy(value: string, what: string) {
  try {
    await Clipboard.setStringAsync(value);
    toast.show(`${what} copied.`);
  } catch {
    toast.show(`Couldn't copy the ${what.toLowerCase()}.`);
  }
}

type RowProps = {
  label: string;
  value?: string;
  mono?: boolean;
  /** Shown with a Copy button when there's a value. */
  copyAs?: string;
  /** Masked until the eye button is tapped (the serial, as in the portal). */
  secret?: boolean;
  last?: boolean;
};

function FactRow({ label, value, mono, copyAs, secret, last }: RowProps) {
  const styles = useStyles();
  const [hidden, setHidden] = useState(!!secret);
  const masked = hidden && !!value;
  return (
    <View style={[styles.row, !last && styles.divider]}>
      <Text variant="caption" color="muted" style={styles.label}>
        {label.toUpperCase()}
      </Text>
      <Text
        style={[styles.value, mono && !!value && styles.mono]}
        numberOfLines={1}
        selectable={!!value && !masked}
        accessibilityLabel={masked ? `${label} hidden` : undefined}
      >
        {masked ? '••••••••' : value || '—'}
      </Text>
      {secret && !!value && (
        <IconButton
          icon={hidden ? Eye : EyeOff}
          size={18}
          color="muted"
          accessibilityLabel={`${hidden ? 'Show' : 'Hide'} ${label.toLowerCase()}`}
          onPress={() => setHidden(!hidden)}
        />
      )}
      {copyAs && !!value && (
        <IconButton
          icon={Copy}
          size={18}
          color="muted"
          accessibilityLabel={`Copy ${copyAs.toLowerCase()}`}
          onPress={() => void copy(value, copyAs)}
        />
      )}
    </View>
  );
}

/** Plant ID, serial, hours, site and model (portal: machine details card). */
export function MachineFacts({ machine: m }: { machine: Machine }) {
  return (
    <Card padded={false}>
      <FactRow label="Plant ID" value={m.plantId} mono copyAs="Plant ID" />
      <FactRow label="Serial" value={m.serial} mono secret copyAs="Serial number" />
      <FactRow label="Hours" value={m.hours !== undefined ? formatHours(m.hours) : undefined} />
      <FactRow label="Site" value={[m.site, m.bench].filter(Boolean).join(' · ')} />
      <FactRow label="Model" value={m.model} last />
    </Card>
  );
}

const useStyles = makeStyles((c) => ({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingLeft: 14, gap: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: c.border },
  label: { width: 76, letterSpacing: 0.4 },
  value: { flex: 1, paddingVertical: 14, paddingRight: 10 },
  mono: { fontFamily: fontFamily.medium, letterSpacing: 0.5 },
}));
