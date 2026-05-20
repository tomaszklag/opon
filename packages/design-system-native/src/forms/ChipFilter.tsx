import React from 'react';
import { ScrollView, Pressable, StyleSheet, View } from 'react-native';
import { t } from '../tokens.native';
import { Text } from '../typography/Text';

interface ChipOption<T extends string | null> {
  value: T;
  label: string;
}

interface ChipFilterProps<T extends string | null> {
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function ChipFilter<T extends string | null>({
  options,
  value,
  onChange,
}: ChipFilterProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.chip, selected ? styles.chipSelected : styles.chipIdle]}
          >
            <Text
              variant="bodySmall"
              weight={selected ? 'semibold' : 'regular'}
              color={selected ? 'textOnAccent' : 'textSecondary'}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={styles.endSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: t.spacing[2],
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[2],
  },
  chip: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[2],
    borderRadius: t.radius.full,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: t.colors.surface,
    borderColor: t.colors.border,
  },
  chipSelected: {
    backgroundColor: t.colors.accent,
    borderColor: t.colors.accent,
  },
  endSpacer: { width: t.spacing[2] },
});
