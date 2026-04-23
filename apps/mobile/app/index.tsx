import * as Sentry from '@sentry/react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN_MOBILE;

if (sentryDsn && sentryDsn !== 'placeholder') {
  Sentry.init({
    dsn: sentryDsn,
    tracesSampleRate: 1.0,
  });
}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello opony</Text>
      <Text style={styles.subtitle}>opony.app — Nowy Sącz</Text>
      <Text style={styles.meta}>Sprint 1 scaffold</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  meta: {
    fontSize: 12,
    color: '#999',
  },
});
