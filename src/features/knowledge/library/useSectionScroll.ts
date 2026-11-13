import { useEffect, useRef, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent, ScrollView } from 'react-native';

const FLASH_MS = 2500;
const TOP_GAP = 12;

/**
 * Section positions for the reader: scroll to one (Contents), track the one in view, and on open
 * jump to `initialSection` (a search hit) and flash it for 2.5 s.
 */
export function useSectionScroll(sectionIds: string[], initialSection?: string) {
  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef(new Map<string, number>());
  const containerY = useRef(0);
  const jumped = useRef(false);
  const [current, setCurrent] = useState<string | undefined>(sectionIds[0]);
  const [flash, setFlash] = useState<string>();

  const scrollTo = (id: string, animated = true) => {
    const y = positions.current.get(id);
    if (y === undefined) return false;
    scrollRef.current?.scrollTo({ y: Math.max(0, containerY.current + y - TOP_GAP), animated });
    return true;
  };

  /** Called by each section; jumps to the search hit once its position is known. */
  const onSectionLayout = (id: string, y: number) => {
    positions.current.set(id, y);
    if (!jumped.current && id === initialSection) {
      jumped.current = true;
      // Wait a frame so everything above has laid out too.
      requestAnimationFrame(() => {
        if (scrollTo(id, false)) setFlash(id);
      });
    }
  };

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(undefined), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flash]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y - containerY.current + TOP_GAP * 3;
    let inView = sectionIds[0];
    for (const id of sectionIds) {
      const top = positions.current.get(id);
      if (top !== undefined && top <= y) inView = id;
    }
    if (inView !== current) setCurrent(inView);
  };

  return {
    scrollRef,
    scrollTo,
    onSectionLayout,
    onContainerLayout: (y: number) => {
      containerY.current = y;
    },
    onScroll,
    current,
    flash,
  };
}
