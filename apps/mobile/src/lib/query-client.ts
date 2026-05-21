import { QueryClient, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

// Nie wywołuj addEventListener tutaj — musi być w useEffect (patrz app/_layout.tsx).
// Wywołanie na poziomie modułu (przed mount komponentu) rzuca ClassCastException
// w New Architecture (JSI strict type checking), co crashuje moduł i powoduje
// "Route _layout.tsx missing default export".
export function setupOnlineManager() {
  return onlineManager.setEventListener((setOnline) =>
    NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected && !!state.isInternetReachable);
    }),
  );
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'always',
    },
  },
});
