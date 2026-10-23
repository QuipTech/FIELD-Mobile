import { ScrollView, View } from 'react-native';

import { ErrorState } from '@/components/ErrorState/ErrorState';
import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
import { Text } from '@/components/Text/Text';
import type { SupportCase } from '@/features/cases/data';
import { KpiGrid, OpenCasesCard, TeamActivityCard } from './AdminCards';
import type { AdminHomeData, AdminKpiKey } from './adminData';
import { AssignedCard, RecentCard, UptimeCard } from './Cards';
import type { HomeData } from './data';
import { HomeHeader } from './HomeHeader';
import { QuickActions, type QuickActionsProps } from './QuickActions';
import { styles } from './styles';

export type HomeProps = QuickActionsProps & {
  title: string;
  initials: string;
  /** Plan badge beside the bell. */
  plan?: string;
  /** Admins get fleet KPIs and team activity instead of their own machines. */
  isAdmin?: boolean;
  /** Admin-only data; ignored for customers. */
  admin?: AdminHomeData;
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
 * Admins see fleet KPIs above the actions and team activity in place of "My machines".
 */
export function Home({ data, error, onRetry, bottomInset, isAdmin, admin, ...props }: HomeProps) {
  return (
    <View style={styles.root}>
      <MeshBackground spots={APP_MESH} />
      <HomeHeader
        title={props.title}
        subtitle={data ? machinesLine(data) : ' '}
        initials={props.initials}
        plan={props.plan}
        onNotifications={props.onNotifications}
        unread={props.unreadNotifications}
        onProfile={props.onProfile}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 16 }]}>
        {isAdmin && admin && <KpiGrid kpis={admin.kpis} onOpen={props.onOpenKpi ?? noop} />}
        <QuickActions {...props} />
        {isAdmin && admin ? (
          <TeamActivityCard items={admin.team} />
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
