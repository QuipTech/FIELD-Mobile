import Constants from 'expo-constants';
import { router, usePathname, type Href } from 'expo-router';
import { DrawerContentScrollView, type DrawerContentComponentProps } from 'expo-router/drawer';
import {
  CircleHelp,
  FileText,
  House,
  LifeBuoy,
  LogOut,
  Settings,
  ShieldCheck,
  Star,
} from 'lucide-react-native';
import { View } from 'react-native';

import { confirmSignOut } from '@/auth/confirmSignOut';
import { useCurrentUser } from '@/auth/useCurrentUser';
import { Text } from '@/components/Text/Text';
import { rateApp } from '@/features/support/links';
import { DrawerHero, DrawerRow, DrawerSection } from './DrawerParts';
import { useDrawerStyles } from './drawerStyles';

/** Secondary destinations, with the same navigation and sign-out behavior as the tabs. */
export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { data: user } = useCurrentUser();
  const pathname = usePathname();
  const styles = useDrawerStyles();
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
      <View style={styles.signOut}>
        <DrawerRow icon={LogOut} label="Sign out" tone="danger" onPress={signOut} />
      </View>
      <View style={styles.footer}>
        <Text variant="label" color="primaryStrong">
          QuipTech FIELD
        </Text>
        <Text variant="caption" color="muted">
          Version {Constants.expoConfig?.version ?? '1.0.0'}
        </Text>
      </View>
    </DrawerContentScrollView>
  );
}
