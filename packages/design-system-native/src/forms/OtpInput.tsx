import React, { useRef } from 'react';
import { View, TextInput, StyleSheet, Pressable } from 'react-native';
import { t } from '../tokens.native';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  error = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputs = useRef<(TextInput | null)[]>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const focusNext = (index: number) => {
    if (index < length - 1) inputs.current[index + 1]?.focus();
  };

  const focusPrev = (index: number) => {
    if (index > 0) inputs.current[index - 1]?.focus();
  };

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    const newValue = newDigits.join('');
    onChange(newValue);
    if (digit) focusNext(index);
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index]) focusPrev(index);
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <Pressable key={index} onPress={() => inputs.current[index]?.focus()}>
          <TextInput
            ref={(el) => {
              inputs.current[index] = el;
            }}
            style={[styles.cell, digit ? styles.cellFilled : null, error ? styles.cellError : null]}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
            keyboardType="numeric"
            maxLength={1}
            autoFocus={autoFocus && index === 0}
            selectTextOnFocus
            caretHidden
            accessibilityLabel={`Cyfra ${index + 1} z ${length}`}
          />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: t.spacing[2],
    justifyContent: 'center',
  },
  cell: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: t.colors.border,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surface,
    color: t.colors.textPrimary,
    fontFamily: t.fontFamily.body,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  cellFilled: {
    borderColor: t.colors.accentBorder,
    backgroundColor: t.colors.accentMuted,
  },
  cellError: {
    borderColor: t.colors.danger,
  },
});
