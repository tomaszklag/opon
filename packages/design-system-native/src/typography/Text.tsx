import React from 'react';
import { Text as RNText, StyleSheet, TextStyle } from 'react-native';
import { t } from '../tokens.native';
import type { ColorKey } from '../tokens.native';

type TextVariant = 'body' | 'bodySmall' | 'caption' | 'mono' | 'label';

interface TextProps {
  variant?: TextVariant;
  color?: ColorKey;
  weight?: 'regular' | 'medium' | 'semibold';
  align?: TextStyle['textAlign'];
  numberOfLines?: number;
  children: React.ReactNode;
  style?: TextStyle;
}

export function Text({
  variant = 'body',
  color = 'textPrimary',
  weight = 'regular',
  align,
  numberOfLines,
  children,
  style,
}: TextProps) {
  return (
    <RNText
      style={[
        styles[variant],
        styles[`w_${weight}`],
        { color: t.colors[color] },
        align ? { textAlign: align } : null,
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  body: {
    fontFamily: t.fontFamily.body,
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: t.fontFamily.body,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: t.fontFamily.body,
    fontSize: 12,
    lineHeight: 16,
  },
  mono: {
    fontFamily: t.fontFamily.mono,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: t.fontFamily.body,
    fontSize: 13,
    lineHeight: 16,
  },
  w_regular: { fontWeight: '400' },
  w_medium: { fontWeight: '500' },
  w_semibold: { fontWeight: '600' },
});
