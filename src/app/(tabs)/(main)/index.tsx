import { router } from 'expo-router';

import { initials, useCurrentUser } from '@/auth/useCurrentUser';
import { useRole } from '@/auth/useRole';
import { usePaymentGate } from '@/features/billing/usePaymentGate';
import { useCases } from '@/features/cases/api';
import { useAdminHomeData, type AdminKpiKey } from '@/features/home/adminData';
import { greeting, useHomeData } from '@/features/home/data';
import { usePortalGuide } from '@/features/home/guideStorage';
import { Home } from '@/features/home/Home';
import { useAdminOverview } from '@/features/home/overviewData';
import { PortalGuide } from '@/features/home/PortalGuide';
import { useTabBarSpace } from '@/features/navigation/tabBarSpace';
import { useUnreadNotifications } from '@/features/notifications/api';

const OPEN_CASES_ON_HOME = 2;

function openKpi(key: AdminKpiKey) {
  if (key === 'machinesDown') router.navigate('/machines');
  else if (key === 'casesNearBreach') router.push('/cases');
  else if (key === 'aiToReview') router.push('/ai-history');
  else if (key === 'bulletinsToApprove') router.navigate('/knowledge');
}

export default function HomeRoute() {
  const { data: user } = useCurrentUser();
  const { isAdmin, capabilities } = useRole();
  const dashboard = useHomeData();
  const admin = useAdminHomeData(isAdmin, dashboard.data?.recent);
  const overview = useAdminOverview(isAdmin);
  const cases = useCases();
  const guide = usePortalGuide(user?.id);
  const unread = useUnreadNotifications();
  const tabBar = useTabBarSpace();
  // An unpaid personal fee blocks the app (after the first-run guide, so they don't stack).
  usePaymentGate(!guide.visible);

  return (
    <>
      <Home
        title={user ? `${greeting()}, ${user.firstName}` : greeting()}
        avatarUrl={user?.avatarUrl}
        initials={user ? initials(user) : ''}
        isAdmin={isAdmin}
        admin={admin.data}
        overview={overview.data}
        onOpenAuditLog={
          capabilities.isPlatformAdmin ? () => router.push('/admin/audit-log') : undefined
        }
        openCases={(cases.data ?? [])
          .filter((c) => c.status === 'open')
          .slice(0, OPEN_CASES_ON_HOME)}
        data={dashboard.data}
        error={dashboard.error}
        onRetry={() => dashboard.refetch()}
        bottomInset={tabBar}
        onSearch={() => router.navigate('/machines')}
        onScan={() => router.push('/scan')}
        onLogEntry={() => router.push('/capture')}
        onNotifications={() => router.push('/notifications')}
        unreadNotifications={unread.data}
        onProfile={() => router.navigate('/me')}
        onSeeAll={() => router.navigate('/machines')}
        onOpenMachine={(id) => router.push({ pathname: '/machine/[id]', params: { id } })}
        onOpenKpi={openKpi}
        onOpenCase={(id) => router.push({ pathname: '/case/[id]', params: { id } })}
        onSeeAllCases={() => router.push('/cases')}
      />
      <PortalGuide visible={guide.visible} onDone={guide.dismiss} />
    </>
  );
}
