import NetInfo, { useNetInfo, type NetInfoState } from '@react-native-community/netinfo';

/** `isInternetReachable` is null while unknown — treat unknown as online. */
export function isOfflineState(state: Pick<NetInfoState, 'isConnected' | 'isInternetReachable'>) {
  return state.isConnected === false || state.isInternetReachable === false;
}

export function useIsOffline(): boolean {
  return isOfflineState(useNetInfo());
}

/** Subscribe to online/offline transitions. Returns unsubscribe. */
export function subscribeOnline(listener: (online: boolean) => void): () => void {
  return NetInfo.addEventListener((state) => listener(!isOfflineState(state)));
}
