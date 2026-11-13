import {
  Award,
  ClipboardCheck,
  File,
  FileText,
  Share2,
  Trash2,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { IconButton } from '@/components/Button/IconButton';
import { Text } from '@/components/Text/Text';
import { formatRelative } from '@/lib/date';
import { formatBytes } from '@/lib/format';
import { colors } from '@/theme';
import { DOCUMENT_TYPE_LABEL, type DocumentType, type MachineDocument } from './documentsApi';
import { styles } from './styles';

const ICON: Record<DocumentType, LucideIcon> = {
  service_report: FileText,
  inspection: ClipboardCheck,
  certificate: Award,
  other: File,
};

/** One document: tap to open; share, and delete when allowed. */
export function DocumentRow(props: {
  doc: MachineDocument;
  onOpen: () => void;
  onShare: () => void;
  onDelete?: () => void;
}) {
  const { doc: d } = props;
  const Icon = ICON[d.documentType];
  const meta = [
    DOCUMENT_TYPE_LABEL[d.documentType],
    formatBytes(d.sizeBytes),
    d.uploadedByName,
    formatRelative(d.uploadedAt),
  ].filter(Boolean);
  return (
    <View style={[styles.row, styles.docRow]}>
      <Pressable
        onPress={props.onOpen}
        style={[styles.row, { flex: 1 }]}
        accessibilityRole="button"
        accessibilityLabel={`Open ${d.fileName}, ${meta.join(', ')}`}
      >
        <View style={styles.iconBox}>
          <Icon size={18} color={colors.ink} strokeWidth={2} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {d.fileName}
          </Text>
          <Text variant="caption" color="inkMuted" numberOfLines={1}>
            {meta.join(' · ')}
          </Text>
        </View>
      </Pressable>
      <IconButton
        icon={Share2}
        size={18}
        color="muted"
        accessibilityLabel={`Share ${d.fileName}`}
        onPress={props.onShare}
      />
      {props.onDelete && (
        <IconButton
          icon={Trash2}
          size={18}
          color="danger"
          accessibilityLabel={`Delete ${d.fileName}`}
          onPress={props.onDelete}
        />
      )}
    </View>
  );
}
