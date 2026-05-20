import { View, StyleSheet } from 'react-native';
import { t, Heading, Text } from '@opony/design-system-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Heading variant="h1" color="accent">
        Opony.app
      </Heading>
      <Text variant="body" color="textSecondary">
        Wyszukiwarka warsztatów — Sprint 4 FE-mobile-2
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: t.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing[6],
    gap: t.spacing[4],
  },
});
