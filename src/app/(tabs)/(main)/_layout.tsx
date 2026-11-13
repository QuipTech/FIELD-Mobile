import { Tabs, useNavigation } from 'expo-router';
import type { DrawerNavigationProp } from 'expo-router/drawer';

import { DrawerMenuContext } from '@/features/navigation/DrawerMenu';

import { TabBar } from '@/features/navigation/TabBar';
import { TabBarSpaceProvider } from '@/features/navigation/tabBarSpace';

export default function TabsLayout() {
  const drawer = useNavigation<DrawerNavigationProp<Record<string, object | undefined>>>('/(tabs)');
  return (
    <DrawerMenuContext.Provider value={() => drawer.openDrawer()}>
      <TabBarSpaceProvider>
        <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
          <Tabs.Screen name="index" />
          <Tabs.Screen name="machines" />
          {/* Centre slot: the raised AI button. */}
          <Tabs.Screen name="ask-ai" />
          <Tabs.Screen name="knowledge" />
          <Tabs.Screen name="me" />
        </Tabs>
      </TabBarSpaceProvider>
    </DrawerMenuContext.Provider>
  );
}
