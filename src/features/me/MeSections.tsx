import {
  Bell,
  BookOpen,
  CloudUpload,
  Compass,
  Download,
  Globe,
  LifeBuoy,
  LogOut,
  Sparkles,
  Truck,
} from 'lucide-react-native';

import { GroupedList, GroupedRow } from '@/components/GroupedList/GroupedList';
import { Text } from '@/components/Text/Text';
import type { MeData } from './data';
import { styles } from './styles';

export type MeDestination =
  | 'billing'
  | 'upgrade'
  | 'downloads'
  | 'sync'
  | 'language'
  | 'machineHistory'
  | 'aiHistory'
  | 'help'
  | 'faqs'
  | 'replayGuide'
  | 'signOut';

export type MeSectionsProps = {
  data: MeData;
  notificationsOn: boolean;
  onToggleNotifications: (on: boolean) => void;
  onNavigate: (to: MeDestination) => void;
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** The M9 settings list, grouped, with sign out on its own at the end. */
export function MeSections({
  data,
  notificationsOn,
  onToggleNotifications,
  onNavigate,
}: MeSectionsProps) {
  const go = (to: MeDestination) => () => onNavigate(to);
  const synced = data.pendingSync === 0;

  return (
    <>
      <SectionLabel>Offline & preferences</SectionLabel>
      <GroupedList>
        <GroupedRow
          icon={Download}
          label="Offline downloads"
          value={plural(data.offlineDocs, 'doc')}
          onPress={go('downloads')}
        />
        <GroupedRow
          icon={CloudUpload}
          iconTone={synced ? 'default' : 'amber'}
          label="Sync"
          value={synced ? 'Up to date' : undefined}
          badge={synced ? undefined : { label: `${data.pendingSync} pending`, tone: 'amber' }}
          onPress={go('sync')}
        />
        <GroupedRow
          icon={Bell}
          label="Notifications"
          toggle={{ value: notificationsOn, onChange: onToggleNotifications }}
        />
        <GroupedRow icon={Globe} label="Language" value={data.language} onPress={go('language')} />
      </GroupedList>

      <SectionLabel>Activity</SectionLabel>
      <GroupedList>
        <GroupedRow icon={Truck} label="My machine history" onPress={go('machineHistory')} />
        <GroupedRow icon={Sparkles} label="AI history" onPress={go('aiHistory')} />
      </GroupedList>

      <SectionLabel>Support</SectionLabel>
      <GroupedList>
        <GroupedRow icon={LifeBuoy} label="Help & support" onPress={go('help')} />
        <GroupedRow icon={BookOpen} label="FAQs" onPress={go('faqs')} />
        <GroupedRow icon={Compass} label="Replay welcome guide" onPress={go('replayGuide')} />
      </GroupedList>

      <GroupedList>
        <GroupedRow
          icon={LogOut}
          iconTone="danger"
          label="Sign out"
          chevron={false}
          onPress={go('signOut')}
        />
      </GroupedList>
    </>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text style={styles.overline} accessibilityRole="header">
      {children}
    </Text>
  );
}
