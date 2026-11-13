import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/ErrorState/ErrorState';
import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
import { Text } from '@/components/Text/Text';
import type { SupportCase } from '@/features/cases/data';
import { KpiGrid, OpenCasesCard, TeamActivityCard } from './AdminCards';
import { IngestionQueueCard, LatestActionsCard, OverviewStats } from './AdminOverview';
import type { AdminHomeData, AdminKpiKey } from './adminData';
import { AssignedCard, RecentCard, UptimeCard } from './Cards';
import type { HomeData } from './data';
import { HomeHeader } from './HomeHeader';
import { HomeStatsRow } from './HomeStats';
import { scopeLine, type AdminOverview } from './overviewData';
import { QuickActions, type QuickActionsProps } from './QuickActions';
import { styles } from './styles';

export type HomeProps = QuickActionsProps & {
  title: string;
  initials: string;
  avatarUrl?: string | null;
  /** Admins get fleet KPIs and team activity instead of their own machines. */
  isAdmin?: boolean;
  /** Admin-only data; ignored for customers. */
  admin?: AdminHomeData;
  /** Admin Overview (`GET /admin/overview`); absent when the account can't read it. */
  overview?: AdminOverview;
  onOpenAuditLog?: () => void;
  /** The customer's open cases. */
  openCases?: SupportCase[];
  /** Undefined while the dashboard loads, or when it failed with nothing cached. */
  data: HomeData | undefined;
  error?: unknown;
  onRetry: () => void;
  onNotifications: () => void;
  unreadNotifications?: number;
  onProfile: () => void;
  onSeeAll: () => void;
  onOpenMachine: (id: string) => void;
  onOpenKpi?: (key: AdminKpiKey) => void;
  onOpenCase?: (id: string) => void;
  onSeeAllCases?: () => void;
  /** Space reserved for the floating tab bar. */
  bottomInset: number;
};

const machinesLine = (d: HomeData) =>
  [d.site, `${d.machineCount} machine${d.machineCount === 1 ? '' : 's'}`]
    .filter(Boolean)
    .join(' · ');

const noop = () => {};

/**
 * M2 / H1 Home. The quick actions work straight away; the cards fill in from GET /dashboard.
 * Scan leads for everyone. Admins then get the platform Overview and what needs attention
 * instead of "My machines".
 */
export function Home({ data, error, onRetry, bottomInset, isAdmin, ...props }: HomeProps) {
  // Admins don't need "Pit 4 · 4 machines": show what they oversee instead.
  const subtitle = isAdmin
    ? (props.overview && scopeLine(props.overview)) || 'Administrator'
    : data
      ? machinesLine(data)
      : ' ';
  return (
    <View style={styles.root}>
      <MeshBackground spots={APP_MESH} />
      <HomeHeader
        title={props.title}
        subtitle={subtitle}
        initials={props.initials}
        avatarUrl={props.avatarUrl}
        onNotifications={props.onNotifications}
        unread={props.unreadNotifications}
        onProfile={props.onProfile}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 16 }]}>
        <QuickActions
          {...props}
          belowSearch={
            !isAdmin && data?.stats ? (
              <HomeStatsRow
                stats={data.stats}
                onOpenCases={props.onSeeAllCases ?? noop}
                onOpenMachines={props.onSeeAll}
              />
            ) : undefined
          }
        />
        {isAdmin ? (
          <AdminSections {...props} />
        ) : data ? (
          <Cards data={data} {...props} />
        ) : error ? (
          <ErrorState error={error} onRetry={onRetry} />
        ) : (
          <SkeletonList rows={3} />
        )}
      </ScrollView>
    </View>
  );
}

/** Admin H1: platform totals, what needs attention, the ingestion queue and recent admin changes. */
function AdminSections({
  admin,
  overview,
  onOpenKpi = noop,
  onOpenAuditLog,
}: Pick<HomeProps, 'admin' | 'overview' | 'onOpenKpi' | 'onOpenAuditLog'>) {
  if (!admin && !overview) return <SkeletonList rows={3} />;
  return (
    <>
      {overview && <OverviewStats overview={overview} />}
      {admin && <KpiGrid kpis={admin.kpis} onOpen={onOpenKpi} />}
      {overview ? (
        <>
          <IngestionQueueCard entries={overview.ingestionQueue} />
          <LatestActionsCard actions={overview.latestActions} onSeeAll={onOpenAuditLog} />
        </>
      ) : (
        admin && <TeamActivityCard items={admin.team} />
      )}
    </>
  );
}

function Cards({
  data,
  openCases = [],
  onSeeAll,
  onOpenMachine,
  onOpenCase = noop,
  onSeeAllCases = noop,
}: Pick<HomeProps, 'onSeeAll' | 'onOpenMachine' | 'openCases' | 'onOpenCase' | 'onSeeAllCases'> & {
  data: HomeData;
}) {
  return (
    <>
      {data.uptime && <UptimeCard uptime={data.uptime} />}

      <View style={styles.baselineRow}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          My machines
        </Text>
        <Text variant="caption" color="brand" onPress={onSeeAll} accessibilityRole="link">
          See all
        </Text>
      </View>
      {data.machines.length === 0 ? (
        <Text variant="caption" color="inkMuted">
          Machines you log work on will show here.
        </Text>
      ) : (
        data.machines.map((item) => (
          <AssignedCard key={item.id} item={item} onPress={() => onOpenMachine(item.id)} />
        ))
      )}

      <OpenCasesCard cases={openCases} onOpenCase={onOpenCase} onSeeAllCases={onSeeAllCases} />

      <Text style={styles.sectionTitle} accessibilityRole="header">
        Recent
      </Text>
      {data.recent.length === 0 ? (
        <Text variant="caption" color="inkMuted">
          Nothing yet. Entries, cases and new documents will show here.
        </Text>
      ) : (
        data.recent.map((item) => <RecentCard key={item.id} item={item} />)
      )}
    </>
  );
}
