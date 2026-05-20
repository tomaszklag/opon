import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import { t } from '../tokens.native';
import type { ColorKey } from '../tokens.native';

type HeadingVariant = 'display' | 'h1' | 'h2' | 'h3';

interface HeadingProps {
  variant?: HeadingVariant;
  color?: ColorKey;
  align?: TextStyle['textAlign'];
  numberOfLines?: number;
  children: React.ReactNode;
  style?: TextStyle;
}

export function Heading({
  variant = 'h1',
  color = 'textPrimary',
  align,
  numberOfLines,
  children,
  style,
}: HeadingProps) {
  return (
    <Text
      style={[
        styles[variant],
        { color: t.colors[color] },
        align ? { textAlign: align } : null,
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: t.fontFamily.display,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: 1,
  },
  h1: {
    fontFamily: t.fontFamily.body,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  h2: {
    fontFamily: t.fontFamily.body,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
  },
  h3: {
    fontFamily: t.fontFamily.body,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
});
