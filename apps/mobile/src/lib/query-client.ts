import { QueryClient, onlineManager } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected && !!state.isInternetReachable);
  }),
);

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
