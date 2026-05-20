import { View, StyleSheet } from 'react-native';
import { t, Text } from '@opony/design-system-native';

export default function MapScreen() {
  return (
    <View style={styles.container}>
      <Text variant="body" color="textMuted">
        Mapa — Sprint 6 FE-mobile-6
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
