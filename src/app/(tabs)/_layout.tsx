import { Drawer } from 'expo-router/drawer';

import { AppDrawerContent } from '@/features/navigation/AppDrawerContent';
import { useTheme } from '@/theme';

/** A side menu around the existing five tabs; detail screens stay in the root stack. */
export default function DrawerLayout() {
  const { colors } = useTheme();
  return (
    <Drawer
      drawerContent={(props) => <AppDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerPosition: 'left',
        drawerStyle: { width: '85%', maxWidth: 360, backgroundColor: colors.bg },
        swipeEdgeWidth: 24,
      }}
    >
      <Drawer.Screen name="(main)" options={{ title: 'FIELD' }} />
    </Drawer>
  );
}
