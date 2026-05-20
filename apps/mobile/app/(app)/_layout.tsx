import { Redirect, Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { t } from '@opony/design-system-native';
import { useAuthStore } from '@/stores/auth.store';
import { HomeIcon, CalendarIcon, MapIcon, UserIcon } from '@/components/icons';

export default function AppLayout() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect href={'/(auth)/login' as never} />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: t.colors.accent,
        tabBarInactiveTintColor: t.colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <View style={styles.tabBarBg} />,
      }}
    >
      <Tabs.Screen
        name="(tabs)/index"
        options={{
          title: 'Strona główna',
          tabBarLabel: 'Główna',
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="(tabs)/bookings"
        options={{
          title: 'Moje rezerwacje',
          tabBarLabel: 'Rezerwacje',
          tabBarIcon: ({ color }) => <CalendarIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="(tabs)/map"
        options={{
          title: 'Mapa',
          tabBarLabel: 'Mapa',
          tabBarIcon: ({ color }) => <MapIcon color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="(tabs)/profile"
        options={{
          title: 'Profil',
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color }) => <UserIcon color={color} size={24} />,
        }}
      />
      {/* Ukryte ekrany (stack ponad tabs) */}
      <Tabs.Screen name="providers/[id]" options={{ href: null }} />
      <Tabs.Screen name="bookings/[id]" options={{ href: null }} />
      <Tabs.Screen name="onboarding/profile" options={{ href: null }} />
      <Tabs.Screen name="onboarding/vehicle" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: t.colors.surface,
    borderTopColor: t.colors.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
  },
  tabBarBg: {
    flex: 1,
    backgroundColor: t.colors.surface,
  },
  tabLabel: {
    fontFamily: t.fontFamily.body,
    fontSize: 11,
    fontWeight: '500',
  },
});
