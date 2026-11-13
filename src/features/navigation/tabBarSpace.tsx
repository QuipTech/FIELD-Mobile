import { createContext, useContext, useState, type ReactNode } from 'react';

type TabBarSpace = { height: number; setHeight: (height: number) => void };

/** Outside the tabs (detail screens in the root stack) nothing floats over the content. */
const Context = createContext<TabBarSpace>({ height: 0, setHeight: () => {} });

/** Holds the floating tab bar's measured height for the tab screens under it. */
export function TabBarSpaceProvider({ children }: { children: ReactNode }) {
  // A close first guess, so content isn't hidden before the bar has measured itself.
  const [height, setHeight] = useState(110);
  return <Context.Provider value={{ height, setHeight }}>{children}</Context.Provider>;
}

/**
 * Space to leave at the bottom of a tab screen so its last item (or composer) clears the
 * floating tab bar. 0 outside the tabs.
 */
export function useTabBarSpace(): number {
  return useContext(Context).height;
}

/** Used by the tab bar to report its height. */
export function useSetTabBarSpace() {
  return useContext(Context).setHeight;
}
