import React from 'react';
import { View, StyleSheet, Pressable, Image } from 'react-native';
import { t } from '../tokens.native';
import { Text } from '../typography/Text';
import { Badge } from './Badge';

type ProviderType = 'MOBILE' | 'STATIONARY' | 'BOTH';

interface ProviderCardProps {
  id: string;
  name: string;
  type: ProviderType;
  logoUrl?: string | null;
  tagline?: string | null;
  address?: string | null;
  serviceRadiusKm?: number;
  avgRating: number;
  reviewCount: number;
  onPress?: () => void;
}

const TYPE_LABEL: Record<ProviderType, string> = {
  MOBILE: 'Dojazd',
  STATIONARY: 'Stacjonarny',
  BOTH: 'Dojazd + Stacjonarny',
};

const TYPE_BADGE_VARIANT: Record<ProviderType, 'accent' | 'info' | 'success'> = {
  MOBILE: 'accent',
  STATIONARY: 'info',
  BOTH: 'success',
};

function RatingStars({ value }: { value: number }) {
  const full = Math.floor(value);
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text
          key={i}
          variant="caption"
          color={i <= full ? 'warning' : 'textMuted'}
          style={styles.star}
        >
          ★
        </Text>
      ))}
    </View>
  );
}

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(' ');
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  return (
    <View style={styles.initialsBox}>
      <Text variant="label" color="accent" weight="semibold">
        {letters.toUpperCase()}
      </Text>
    </View>
  );
}

export function ProviderCard({
  name,
  type,
  logoUrl,
  tagline,
  address,
  serviceRadiusKm,
  avgRating,
  reviewCount,
  onPress,
}: ProviderCardProps) {
  const locationLine =
    type === 'MOBILE'
      ? serviceRadiusKm
        ? `Dojazd do ${serviceRadiusKm} km`
        : 'Dojazd'
      : (address ?? null);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.logoWrap}>
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={styles.logo} resizeMode="cover" />
        ) : (
          <Initials name={name} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text
            variant="body"
            weight="semibold"
            color="textPrimary"
            numberOfLines={1}
            style={styles.name}
          >
            {name}
          </Text>
          <Badge label={TYPE_LABEL[type]} variant={TYPE_BADGE_VARIANT[type]} size="sm" />
        </View>

        {tagline ? (
          <Text variant="bodySmall" color="textSecondary" numberOfLines={1}>
            {tagline}
          </Text>
        ) : null}

        <View style={styles.bottomRow}>
          <View style={styles.ratingRow}>
            <RatingStars value={avgRating} />
            <Text variant="caption" color="textMuted">
              {avgRating.toFixed(1)} ({reviewCount})
            </Text>
          </View>
          {locationLine ? (
            <Text variant="caption" color="textMuted" numberOfLines={1}>
              {locationLine}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.lg,
    borderWidth: 1,
    borderColor: t.colors.hairline,
    padding: t.spacing[4],
    gap: t.spacing[3],
    alignItems: 'flex-start',
  },
  pressed: { opacity: 0.85 },
  logoWrap: {
    width: 52,
    height: 52,
    flexShrink: 0,
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: t.radius.md,
  },
  initialsBox: {
    width: 52,
    height: 52,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: t.spacing[1],
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
  },
  name: { flex: 1 },
  bottomRow: {
    gap: t.spacing[1],
    marginTop: t.spacing[1],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[1],
  },
  stars: {
    flexDirection: 'row',
  },
  star: { lineHeight: 14 },
});
