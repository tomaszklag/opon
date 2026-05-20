import { Link, Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Heading, Text, Button } from '@opony/design-system-native';
import { t } from '@opony/design-system-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Nie znaleziono strony' }} />
      <View style={styles.container}>
        <Heading variant="display" color="accent">
          404
        </Heading>
        <Heading variant="h2" align="center">
          Strona nie istnieje
        </Heading>
        <Text variant="body" color="textSecondary" align="center">
          Adres, który próbujesz odwiedzić, nie istnieje lub został przeniesiony.
        </Text>
        <Link href="/" asChild>
          <Button variant="primary" size="lg">
            Wróć do aplikacji
          </Button>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing[8],
    gap: t.spacing[4],
  },
});
