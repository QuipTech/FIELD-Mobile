import type { ReactNode } from 'react';
import { Switch, View } from 'react-native';

import { Badge } from '@/components/Badge/Badge';
import { Button } from '@/components/Button/Button';
import { Sheet } from '@/components/Sheet/Sheet';
import { Text } from '@/components/Text/Text';
import { formatDate } from '@/lib/date';
import { formatNumber } from '@/lib/format';
import { borders, makeStyles, spacing, useTheme } from '@/theme';
import { DOC_TYPE, type DocStatus, type KnowledgeDoc } from './types';

const STATUS: Record<
  DocStatus,
  { label: string; tone: 'primary' | 'warning' | 'danger' | 'neutral' }
> = {
  live: { label: 'Live', tone: 'primary' },
  review: { label: 'Needs review', tone: 'warning' },
  failed: { label: 'Index failed', tone: 'danger' },
  archived: { label: 'Archived', tone: 'neutral' },
};

export type DocInfoSheetProps = {
  visible: boolean;
  onClose: () => void;
  doc: KnowledgeDoc;
  isAdmin: boolean;
  savedOffline: boolean;
  onToggleOffline: () => void;
  /** Admin document actions. */
  onApprove?: () => void;
  onNewVersion?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
};

/** K5b Document info: metadata, "Available offline" and (admins) status and actions. */
export function DocInfoSheet(props: DocInfoSheetProps) {
  const { doc, isAdmin } = props;
  const styles = useStyles();
  const { colors } = useTheme();
  const type = DOC_TYPE[doc.type];
  const status = STATUS[doc.status];
  return (
    <Sheet visible={props.visible} onClose={props.onClose} title="Document info">
      <View>
        {isAdmin && (
          <>
            <Row label="Status">
              <Badge label={status.label} tone={status.tone} />
            </Row>
            {doc.indexedSections !== undefined && (
              <Row
                label="Indexed"
                value={`${formatNumber(doc.indexedSections)} sections · ${formatDate(doc.updatedAt)}`}
              />
            )}
          </>
        )}
        <Row label="Brand" value={doc.brandName} />
        <Row label="Category" value={doc.categoryName} />
        <Row label="Type">
          <Badge label={type.label} tone={type.tone} />
        </Row>
        <Row label="Machine models" value={doc.models.join(', ')} />
        <Row label="Version" value={doc.version} />
        {doc.approvedBy && <Row label="Approved by" value={doc.approvedBy} />}
        <Row
          label={doc.status === 'live' ? 'Approved' : 'Uploaded'}
          value={formatDate(doc.updatedAt)}
        />
        <Row label="Pages" value={`${formatNumber(doc.pageCount)} · ${doc.sizeMb} MB`} />
        <View style={[styles.row, styles.last]}>
          <View style={styles.toggleText}>
            <Text variant="bodyMedium">Available offline</Text>
            <Text variant="caption" color="muted">
              {props.savedOffline ? 'Saved on this device' : `Uses ${doc.sizeMb} MB`}
            </Text>
          </View>
          <Switch
            value={props.savedOffline}
            onValueChange={props.onToggleOffline}
            trackColor={{ true: colors.button, false: colors.borderStrong }}
            thumbColor={colors.onButton}
            accessibilityLabel="Available offline"
          />
        </View>
      </View>
      {isAdmin && <AdminActions {...props} />}
    </Sheet>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  const styles = useStyles();
  return (
    <View style={styles.row} accessible accessibilityLabel={value ? `${label}: ${value}` : label}>
      <Text color="muted" variant="row">
        {label}
      </Text>
      {children ?? (
        <Text variant="row" style={styles.value}>
          {value}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 13,
    borderBottomWidth: borders.hairline,
    borderBottomColor: c.border,
  },
  last: { borderBottomWidth: 0 },
  value: { flexShrink: 1, textAlign: 'right' },
  toggleText: { flex: 1, gap: 2 },
  actions: { flexDirection: 'row', gap: spacing.xs, paddingTop: spacing.snug },
  flex: { flex: 1 },
}));

/** Approve, new version, archive and delete, when the route allows them. */
function AdminActions(props: DocInfoSheetProps) {
  const styles = useStyles();
  return (
    <View style={styles.actions}>
      {props.onApprove && (
        <Button label="Approve" size="small" onPress={props.onApprove} style={styles.flex} />
      )}
      {props.onNewVersion && (
        <Button
          label="New version"
          size="small"
          variant="secondary"
          onPress={props.onNewVersion}
          style={styles.flex}
        />
      )}
      {props.onArchive && (
        <Button
          label="Archive"
          size="small"
          variant="secondary"
          onPress={props.onArchive}
          style={styles.flex}
        />
      )}
      {props.onDelete && (
        <Button label="Delete" size="small" variant="danger" onPress={props.onDelete} />
      )}
    </View>
  );
}
