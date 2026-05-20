import { View, StyleSheet } from 'react-native';
import { t, Text } from '@opony/design-system-native';

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="body" color="textMuted">
        Moje rezerwacje — Sprint 5 FE-mobile-3
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
  },
});
