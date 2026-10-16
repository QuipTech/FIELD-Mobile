import { router } from 'expo-router';

import { initials, useCurrentUser } from '@/auth/useCurrentUser';
import { toast } from '@/components';
import { greeting, useHomeData } from '@/features/home/data';
import { usePortalGuide } from '@/features/home/guideStorage';
import { Home } from '@/features/home/Home';
import { PortalGuide } from '@/features/home/PortalGuide';

const comingSoon = (what: string) => () => toast.show(`${what} is coming soon.`);

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
        onScan={comingSoon('Scanning assets')}
        onLogEntry={comingSoon('Logging entries')}
        onCapture={comingSoon('Capture')}
        onNotifications={comingSoon('Notifications')}
        onProfile={() => router.navigate('/me')}
        onSeeAll={() => router.navigate('/machines')}
        onOpenMachine={comingSoon('Machine details')}
      />
      <PortalGuide visible={guide.visible} onDone={guide.dismiss} />
    </>
  );
}
