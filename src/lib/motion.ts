import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** False until checked, and whenever the user has Reduce Motion on; follows live changes. */
export function useMotionAllowed() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (!cancelled) setAllowed(!reduce);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduce) =>
      setAllowed(!reduce),
    );
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
  return allowed;
}
