import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

const key = (userId: string) => `portalGuideSeen:${userId}`;

/**
 * M2b portal guide shows on a user's first sign-in on this device, then never again
 * (unless replayed from Me). Per user, so a shared device still guides each new person.
 */
export function usePortalGuide(userId: string | undefined) {
  const [visible, setVisible] = useState(false);

  // Re-checked whenever Home gains focus, so "show again" from Me takes effect right away.
  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      let cancelled = false;
      AsyncStorage.getItem(key(userId))
        .then((seen) => !cancelled && setVisible(seen === null))
        .catch(() => undefined); // storage unavailable: skip the guide rather than block Home
      return () => {
        cancelled = true;
      };
    }, [userId]),
  );

  const dismiss = useCallback(() => {
    setVisible(false);
    if (userId) AsyncStorage.setItem(key(userId), new Date().toISOString()).catch(() => undefined);
  }, [userId]);

  return { visible, dismiss };
}

/** Clears the flag so the guide shows again on the next visit to Home. */
export const resetPortalGuide = (userId: string) => AsyncStorage.removeItem(key(userId));
