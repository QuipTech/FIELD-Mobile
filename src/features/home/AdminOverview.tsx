import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  History,
  Loader,
  type LucideIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

import { Pill, type PillTone } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { formatRelative } from '@/lib/date';
import { colors } from '@/theme';
import type { AdminAction, QueueEntry } from './overviewData';
import { styles } from './overviewStyles';
import { styles as home } from './styles';

const count = (n: number) => n.toLocaleString('en-AU');

export { OverviewStats } from './OverviewStats';

const QUEUE: Record<string, { label: string; tone: PillTone; icon: LucideIcon; color: string }> = {
  indexing: { label: 'Indexing', tone: 'brand', icon: Loader, color: colors.brandDeep },
  queued: { label: 'Queued', tone: 'neutral', icon: FileText, color: colors.inkMuted },
  failed: { label: 'Failed', tone: 'danger', icon: AlertTriangle, color: colors.danger },
  needs_review: { label: 'Pending review', tone: 'amber', icon: CheckCircle2, color: colors.amber },
};

function queueDetail(e: QueueEntry) {
  const pages = e.pageCount ? `${count(e.pageCount)} pages` : null;
  const parts =
    e.state === 'indexing'
      ? [pages, `${e.progress ?? 0}% indexed`]
      : e.state === 'queued'
        ? [
            e.queuePosition && e.queuePosition > 1
              ? `Behind ${e.queuePosition - 1} jobs`
              : 'Next in line',
          ]
        : e.state === 'failed'
          ? [e.errorMessage ?? 'Indexing failed']
          : [
              e.uploadedBy ? `Uploaded by ${e.uploadedBy}` : null,
              e.uploadedAt ? formatRelative(e.uploadedAt) : null,
            ];
  return [...parts, e.organisationName].filter(Boolean).join(' · ');
}

function Section({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={home.baselineRow}>
      <Text style={home.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {action && onAction ? (
        <Text variant="caption" color="brand" onPress={onAction} accessibilityRole="link">
          {action}
        </Text>
      ) : null}
    </View>
  );
}

function Row({
  icon: Icon,
  color,
  title,
  detail,
  trailing,
  last,
}: {
  icon: LucideIcon;
  color: string;
  title: string;
  detail: string;
  trailing?: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View
      style={[styles.row, !last && styles.rowDivider]}
      accessible
      accessibilityLabel={`${title}. ${detail}`}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.fill }]}>
        <Icon size={18} color={color} strokeWidth={2} />
      </View>
      <View style={home.cardText}>
        <Text style={home.itemTitle} numberOfLines={2}>
          {title}
        </Text>
        <Text variant="caption" color="inkMuted" numberOfLines={2}>
          {detail}
        </Text>
      </View>
      {trailing}
    </View>
  );
}

/** Documents waiting to become searchable, newest problems first. */
export function IngestionQueueCard({ entries }: { entries: QueueEntry[] }) {
  return (
    <>
      <Section title="Ingestion queue" />
      <View style={[home.card, styles.list]}>
        {entries.length === 0 ? (
          <Text variant="caption" color="inkMuted" style={styles.empty}>
            Nothing waiting. Every document is searchable.
          </Text>
        ) : (
          entries.map((e, i) => {
            const s = QUEUE[e.state] ?? QUEUE.queued!;
            return (
              <Row
                key={e.id}
                icon={s.icon}
                color={s.color}
                title={e.title}
                detail={queueDetail(e)}
                trailing={<Pill label={s.label} tone={s.tone} />}
                last={i === entries.length - 1}
              />
            );
          })
        )}
      </View>
    </>
  );
}

/** Latest changes admins made (users, roles, prompts…), with a link to the full audit log. */
export function LatestActionsCard({
  actions,
  onSeeAll,
}: {
  actions: AdminAction[];
  onSeeAll?: () => void;
}) {
  return (
    <>
      <Section title="Latest admin actions" action="Audit log" onAction={onSeeAll} />
      <View style={[home.card, styles.list]}>
        {actions.length === 0 ? (
          <Text variant="caption" color="inkMuted" style={styles.empty}>
            No changes recorded yet.
          </Text>
        ) : (
          actions.map((a, i) => (
            <Row
              key={a.id}
              icon={History}
              color={colors.brandDeep}
              title={a.target ? `${a.actionLabel} · ${a.target}` : a.actionLabel}
              detail={[a.actor?.name ?? 'System', formatRelative(a.occurredAt)].join(' · ')}
              last={i === actions.length - 1}
            />
          ))
        )}
      </View>
    </>
  );
}
