import { View } from 'react-native';

import { signOutUser } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { useCurrentUser } from '@/auth/useCurrentUser';
import { BrandButton, toast } from '@/components';
import { resetPortalGuide } from '@/features/home/guideStorage';
import { TabPlaceholder } from '@/features/navigation/TabPlaceholder';
import { spacing } from '@/theme';

/** TEMPORARY: minimal Me tab (sign out, replay guide) until M9 Profile is built. */
export default function MeRoute() {
  const { data: user } = useCurrentUser();
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : '';

  return (
    <TabPlaceholder title={name || 'Me'} message={user?.email ?? ''}>
      <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
        <BrandButton
          variant="outline"
          label="Show the welcome guide again"
          onPress={async () => {
            if (!user) return;
            await resetPortalGuide(user.id);
            toast.show('The guide will show when you open Home.');
          }}
        />
        <BrandButton label="Sign out" onPress={() => runAuth(signOutUser)} />
      </View>
    </TabPlaceholder>
  );
}
