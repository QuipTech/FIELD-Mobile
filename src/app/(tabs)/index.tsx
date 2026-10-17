import { router } from 'expo-router';

import { initials, useCurrentUser } from '@/auth/useCurrentUser';
import { greeting, useHomeData } from '@/features/home/data';
import { usePortalGuide } from '@/features/home/guideStorage';
import { Home } from '@/features/home/Home';
import { PortalGuide } from '@/features/home/PortalGuide';

export default function HomeRoute() {
  const { data: user } = useCurrentUser();
  const { data, isSample } = useHomeData();
  const guide = usePortalGuide(user?.id);

  return (
    <>
      <Home
        title={user ? `${greeting()}, ${user.firstName}` : greeting()}
        initials={user ? initials(user) : ''}
        data={data}
        isSample={isSample}
        bottomInset={0}
        onSearch={() => router.navigate('/machines')}
        onAskAi={() => router.navigate('/ask-ai')}
        onScan={() => router.push('/scan')}
        onLogEntry={() => router.push('/capture')}
        onCapture={() => router.push('/capture')}
        onNotifications={() => router.push('/notifications')}
        onProfile={() => router.navigate('/me')}
        onSeeAll={() => router.navigate('/machines')}
        onOpenMachine={(id) => router.push({ pathname: '/machine/[id]', params: { id } })}
      />
      <PortalGuide visible={guide.visible} onDone={guide.dismiss} />
    </>
  );
}
