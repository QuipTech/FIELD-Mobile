import Constants from 'expo-constants';
import { router, usePathname, type Href } from 'expo-router';
import { DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import {
  CircleHelp,
  CreditCard,
  Database,
  FileText,
  House,
  Layers,
  LifeBuoy,
  LogOut,
  Mail,
  ScrollText,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  UserCog,
  Users,
} from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { confirmSignOut } from '@/auth/confirmSignOut';
import { useCurrentUser } from '@/auth/useCurrentUser';
import { useRole } from '@/auth/useRole';
import { Text } from '@/components/Text/Text';
import { rateApp } from '@/features/support/links';
import { DrawerHero, DrawerRow, DrawerSection } from './DrawerParts';
import { useDrawerStyles } from './drawerStyles';

/** Secondary destinations, with the same navigation and sign-out behavior as the tabs. */
/** Platform admin (`platform.manage`) screens, as in the web portal's Admin menu. */
const ADMIN_ITEMS = [
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/roles', label: 'Roles & permissions', icon: UserCog },
  { href: '/admin/audit-log', label: 'Audit log', icon: ScrollText },
  { href: '/admin/billing', label: 'Billing', icon: CreditCard },
  { href: '/admin/demo-requests', label: 'Demo requests', icon: Mail },
  { href: '/admin/ai-configuration', label: 'AI configuration', icon: SlidersHorizontal },
  { href: '/admin/machine-library', label: 'Machine library', icon: Database },
  { href: '/admin/machine-groups', label: 'Machine groups', icon: Layers },
] as const;

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { data: user } = useCurrentUser();
  const pathname = usePathname();
  const { capabilities } = useRole();
  const styles = useDrawerStyles();
  const insets = useSafeAreaInsets();
  const close = () => props.navigation.closeDrawer();
  const name = user ? `${user.firstName} ${user.lastName}`.trim() : 'Your account';
  const go = (href: Href) => () => {
    close();
    router.navigate(href);
  };
  const rate = () => {
    close();
    void rateApp();
  };
  const signOut = () => {
    close();
    confirmSignOut();
  };
  return (
    <View style={styles.root}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.content}>
        <DrawerHero name={name} email={user?.email} avatarUrl={user?.avatarUrl} onClose={close} />
        <DrawerSection title="Workspace">
          <DrawerRow icon={House} label="Home" selected={pathname === '/'} onPress={go('/')} />
          <DrawerRow
            icon={Settings}
            label="Profile & settings"
            selected={pathname === '/me'}
            onPress={go('/me')}
          />
        </DrawerSection>
        {capabilities.isPlatformAdmin && (
          <DrawerSection title="Administration">
            {ADMIN_ITEMS.map((item) => (
              <DrawerRow
                key={item.href}
                icon={item.icon}
                label={item.label}
                selected={pathname.startsWith(item.href)}
                onPress={go(item.href)}
              />
            ))}
          </DrawerSection>
        )}
        <DrawerSection title="Help & feedback">
          <DrawerRow icon={CircleHelp} label="FAQs" onPress={go('/faq')} />
          <DrawerRow icon={LifeBuoy} label="Support cases" tone="success" onPress={go('/cases')} />
          <DrawerRow icon={Star} label="Rate this app" tone="warning" onPress={rate} />
        </DrawerSection>
        <DrawerSection title="Legal">
          <DrawerRow
            icon={ShieldCheck}
            label="Privacy policy"
            tone="success"
            onPress={go('/privacy-policy')}
          />
          <DrawerRow icon={FileText} label="Terms of service" onPress={go('/terms')} />
        </DrawerSection>
      </DrawerContentScrollView>
      {/* Pinned under the list so it is always in reach. */}
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 8 }]}>
        <View style={styles.signOut}>
          <DrawerRow icon={LogOut} label="Log out" tone="danger" onPress={signOut} />
        </View>
        <Text variant="caption" color="muted" style={styles.version}>
          QuipTech FIELD · Version {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </View>
    </View>
  );
}
