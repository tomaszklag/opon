import React from 'react';
import { View } from 'react-native';
import { t } from '@opony/design-system-native';

// Minimalne SVG-like ikony przez View (placeholder do Sprint 4)
// W docelowej wersji zastąpić przez @expo/vector-icons lub react-native-svg

interface IconProps {
  color?: string;
  size?: number;
}

function Icon({ size = 24, children }: { size: number; children: React.ReactNode }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </View>
  );
}

export function HomeIcon({ color = t.colors.textMuted, size = 24 }: IconProps) {
  return (
    <Icon size={size}>
      <View
        style={{
          width: size * 0.75,
          height: size * 0.75,
          borderWidth: 2,
          borderColor: color,
          borderRadius: 4,
        }}
      />
    </Icon>
  );
}

export function CalendarIcon({ color = t.colors.textMuted, size = 24 }: IconProps) {
  return (
    <Icon size={size}>
      <View
        style={{
          width: size * 0.75,
          height: size * 0.75,
          borderWidth: 2,
          borderColor: color,
          borderRadius: 3,
        }}
      />
    </Icon>
  );
}

export function MapIcon({ color = t.colors.textMuted, size = 24 }: IconProps) {
  return (
    <Icon size={size}>
      <View
        style={{
          width: size * 0.5,
          height: size * 0.75,
          borderWidth: 2,
          borderColor: color,
          borderRadius: size * 0.25,
          borderBottomLeftRadius: size * 0.4,
          borderBottomRightRadius: size * 0.4,
        }}
      />
    </Icon>
  );
}

export function UserIcon({ color = t.colors.textMuted, size = 24 }: IconProps) {
  return (
    <Icon size={size}>
      <View
        style={{
          width: size * 0.5,
          height: size * 0.5,
          borderWidth: 2,
          borderColor: color,
          borderRadius: size * 0.25,
        }}
      />
    </Icon>
  );
}
