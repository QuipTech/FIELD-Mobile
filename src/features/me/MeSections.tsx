import {
  Bell,
  CloudUpload,
  Compass,
  CreditCard,
  Download,
  FingerprintPattern,
  Globe,
  LifeBuoy,
  LogOut,
  Sparkles,
  ScanFace,
  Users,
} from 'lucide-react-native';

import type { BiometricSupport } from '@/auth/biometrics';
import { GroupedList, GroupedRow } from '@/components/GroupedList/GroupedList';
import { Text } from '@/components/Text/Text';
import { formatNumber } from '@/lib/format';
import type { MeData, TeamSummary } from './data';
import { styles } from './styles';

export type MeDestination =
  | 'billing'
  | 'team'
  | 'cases'
  | 'downloads'
  | 'sync'
  | 'language'
  | 'aiHistory'
  | 'replayGuide'
  | 'signOut';

export type MeSectionsProps = {
  data: MeData;
  /** Admins manage the team and billing; technicians only see their plan and usage. */
  isAdmin: boolean;
  /** Admin only. */
  team?: TeamSummary;
  notificationsOn: boolean;
  onToggleNotifications: (on: boolean) => void;
  /** Face ID / fingerprint sign-in; omitted when the device has no enrolled biometrics. */
  biometric?: { support: BiometricSupport; on: boolean; onToggle: (on: boolean) => void };
  onNavigate: (to: MeDestination) => void;
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/** The M9 settings list, grouped, with sign out on its own at the end. */
export function MeSections({
  data,
  isAdmin,
  team,
  notificationsOn,
  onToggleNotifications,
  biometric,
  onNavigate,
}: MeSectionsProps) {
  const go = (to: MeDestination) => () => onNavigate(to);
  const synced = data.pendingSync === 0;

  return (
    <>
      <AccountSection data={data} isAdmin={isAdmin} team={team} onNavigate={onNavigate} />

      {biometric && (
        <>
          <SectionLabel>Security</SectionLabel>
          <GroupedList>
            <GroupedRow
              icon={biometric.support.kind === 'face' ? ScanFace : FingerprintPattern}
              label={`Sign in with ${biometric.support.label}`}
              toggle={{ value: biometric.on, onChange: biometric.onToggle }}
            />
          </GroupedList>
        </>
      )}

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
        <GroupedRow icon={LifeBuoy} label="Support cases" onPress={go('cases')} />
        <GroupedRow icon={Sparkles} label="AI history" onPress={go('aiHistory')} />
      </GroupedList>

      <GroupedList>
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

/** Admins manage the team and billing; technicians see their plan, managed by the admin. */
function AccountSection({
  data,
  isAdmin,
  team,
  onNavigate,
}: Pick<MeSectionsProps, 'data' | 'isAdmin' | 'team' | 'onNavigate'>) {
  const go = (to: MeDestination) => () => onNavigate(to);
  const planName = data.plan?.name.replace(/ plan$/i, '') ?? 'Plan';

  return (
    <>
      <SectionLabel>Account</SectionLabel>
      {isAdmin ? (
        <GroupedList>
          <GroupedRow
            icon={Users}
            label="Team & roles"
            value={
              team
                ? [plural(team.users, 'user'), team.sites ? plural(team.sites, 'site') : '']
                    .filter(Boolean)
                    .join(' · ')
                : undefined
            }
            onPress={go('team')}
          />
          <GroupedRow
            icon={CreditCard}
            label="Billing & plan"
            value={data.plan ? `${planName} · ${formatNumber(data.plan.assets)} assets` : undefined}
            onPress={go('billing')}
          />
        </GroupedList>
      ) : (
        <GroupedList>
          <GroupedRow
            icon={CreditCard}
            label="Plan & usage"
            value={`${planName} · managed by your admin`}
            onPress={go('billing')}
          />
        </GroupedList>
      )}
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
