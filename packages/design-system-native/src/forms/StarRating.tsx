import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { t } from '../tokens.native';
import { Text } from '../typography/Text';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const FONT_SIZE: Record<'sm' | 'md' | 'lg', number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

export function StarRating({ value, onChange, size = 'md' }: StarRatingProps) {
  const fontSize = FONT_SIZE[size];
  const interactive = !!onChange;

  return (
    <View
      style={styles.row}
      accessible={!interactive}
      accessibilityLabel={!interactive && value > 0 ? `Ocena: ${value} na 5 gwiazdek` : undefined}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const starChar = filled ? '★' : '☆';

        if (!interactive) {
          return (
            <Text
              key={star}
              variant="body"
              color={filled ? 'warning' : 'textMuted'}
              style={{ fontSize, lineHeight: fontSize + 4 }}
            >
              {starChar}
            </Text>
          );
        }

        return (
          <Pressable
            key={star}
            onPress={() => onChange(star)}
            accessibilityRole="button"
            accessibilityLabel={`Oceń na ${star} gwiazdek`}
            hitSlop={t.spacing[2]}
          >
            <Text
              variant="body"
              color={filled ? 'warning' : 'textMuted'}
              style={{ fontSize, lineHeight: fontSize + 4 }}
            >
              {starChar}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: t.spacing[1],
  },
});
