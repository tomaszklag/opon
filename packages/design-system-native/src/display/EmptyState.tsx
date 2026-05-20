import React from 'react';
import { View, StyleSheet } from 'react-native';
import { t } from '../tokens.native';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';
import { Button } from '../forms/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, ctaLabel, onCtaPress, icon }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Heading variant="h2" align="center">
        {title}
      </Heading>
      {description ? (
        <Text variant="body" color="textSecondary" align="center" style={styles.description}>
          {description}
        </Text>
      ) : null}
      {ctaLabel && onCtaPress ? (
        <Button variant="primary" onPress={onCtaPress} style={styles.cta}>
          {ctaLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: t.spacing[8],
    gap: t.spacing[4],
  },
  icon: { marginBottom: t.spacing[2] },
  description: { maxWidth: 280 },
  cta: { marginTop: t.spacing[2] },
});
