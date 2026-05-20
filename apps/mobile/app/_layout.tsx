import { useEffect } from 'react';
import { Stack, useSegments, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { ToastProvider } from '@opony/design-system-native';
import { queryClient, setupOnlineManager } from '@/lib/query-client';
import { useAuthStore } from '@/stores/auth.store';
import { initMsw } from '../mocks';

SplashScreen.preventAutoHideAsync();
initMsw();

function AuthGuard({ isAuthenticated }: { isAuthenticated: boolean }) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = (segments as string[])[0] === '(auth)';
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login' as never);
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/' as never);
    }
  }, [isAuthenticated, segments, router]);

  return null;
}

export default function RootLayout() {
  const { rehydrated, isAuthenticated } = useAuthStore();

  useEffect(() => {
    return setupOnlineManager();
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    BebasNeue: require('../assets/fonts/BebasNeue-Regular.ttf'),
    Archivo: require('../assets/fonts/Archivo-Regular.ttf'),
    'Archivo-Medium': require('../assets/fonts/Archivo-Medium.ttf'),
    'Archivo-SemiBold': require('../assets/fonts/Archivo-SemiBold.ttf'),
    JetBrainsMono: require('../assets/fonts/JetBrainsMono-Regular.ttf'),
  });

  const ready = rehydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <StatusBar style="light" backgroundColor="#0A0B0E" />
        <AuthGuard isAuthenticated={isAuthenticated} />
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0B0E' } }}
        />
      </ToastProvider>
    </QueryClientProvider>
  );
}
