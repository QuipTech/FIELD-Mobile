import { Menu } from 'lucide-react-native';
import { createContext, useContext } from 'react';

import { IconButton } from '@/components/Button/IconButton';

export const DrawerMenuContext = createContext<(() => void) | undefined>(undefined);

/** Hidden outside the tabs, including detail screens and isolated screen previews. */
export function DrawerMenuButton() {
  const open = useContext(DrawerMenuContext);
  return open ? <IconButton icon={Menu} accessibilityLabel="Open menu" onPress={open} /> : null;
}
