import { ScrollView, View } from 'react-native';

import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { Text } from '@/components/Text/Text';
import { AssignedCard, RecentCard, UptimeCard } from './Cards';
import type { HomeData } from './data';
import { HomeHeader } from './HomeHeader';
import { QuickActions, type QuickActionsProps } from './QuickActions';
import { styles } from './styles';

export type HomeProps = QuickActionsProps & {
  title: string;
  initials: string;
  data: HomeData;
  /** Shows a small note while the cards use sample data. */
  isSample?: boolean;
  onNotifications: () => void;
  onProfile: () => void;
  onSeeAll: () => void;
  onOpenMachine: (id: string) => void;
  /** Space reserved for the floating tab bar. */
  bottomInset: number;
};

/** M2 Home. */
export function Home({ data, isSample, bottomInset, ...props }: HomeProps) {
  return (
    <View style={styles.root}>
      <MeshBackground spots={APP_MESH} />
      <HomeHeader
        title={props.title}
        subtitle={`${data.site} · ${data.assignedCount} machines assigned`}
        initials={props.initials}
        onNotifications={props.onNotifications}
        onProfile={props.onProfile}
      />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottomInset + 16 }]}>
        <QuickActions {...props} />
        <UptimeCard uptime={data.uptime} />

        <View style={styles.baselineRow}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Assigned to me
          </Text>
          <Text variant="caption" color="brand" onPress={props.onSeeAll} accessibilityRole="link">
            See all
          </Text>
        </View>
        {data.assigned.map((item) => (
          <AssignedCard key={item.id} item={item} onPress={() => props.onOpenMachine(item.id)} />
        ))}

        <Text style={styles.sectionTitle} accessibilityRole="header">
          Recent
        </Text>
        {data.recent.map((item) => (
          <RecentCard key={item.id} item={item} />
        ))}

        {isSample && (
          <Text variant="caption" color="inkSubtle" style={styles.sampleNote}>
            Sample data — live fleet data arrives with the API.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
