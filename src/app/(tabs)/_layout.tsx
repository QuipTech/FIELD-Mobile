import { Tabs } from 'expo-router';

import { TabBar } from '@/features/navigation/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="machines" />
      <Tabs.Screen name="ask-ai" />
      <Tabs.Screen name="cases" />
      <Tabs.Screen name="me" />
    </Tabs>
  );
}
