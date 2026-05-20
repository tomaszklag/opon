import { ScrollView, View, StyleSheet, Pressable, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { t, Heading, Text, Button, Badge, Spinner } from '@opony/design-system-native';
import { useProvider, useProviderReviews } from '@/hooks/providers/use-provider';

function BackButton() {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.back()}
      style={styles.backBtn}
      accessibilityRole="button"
      accessibilityLabel="Wróć"
    >
      <Text variant="body" color="accent">
        ← Wróć
      </Text>
    </Pressable>
  );
}

function RatingRow({ rating, count }: { rating: number; count: number }) {
  return (
    <View style={styles.ratingRow}>
      <Text variant="body" color="warning" weight="semibold">
        {'★'.repeat(Math.round(rating))}
        {'☆'.repeat(5 - Math.round(rating))}
      </Text>
      <Text variant="bodySmall" color="textSecondary">
        {rating.toFixed(1)} · {count} {count === 1 ? 'opinia' : 'opinii'}
      </Text>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text variant="label" color="textSecondary" style={styles.sectionHeader}>
      {title.toUpperCase()}
    </Text>
  );
}

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: provider, isLoading, isError } = useProvider(id);
  const { data: reviews } = useProviderReviews(id);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  if (isError || !provider) {
    return (
      <View style={styles.center}>
        <BackButton />
        <Text variant="body" color="textSecondary">
          Nie udało się załadować danych warsztatu.
        </Text>
      </View>
    );
  }

  const typeLabel =
    provider.type === 'MOBILE'
      ? 'Dojazd'
      : provider.type === 'STATIONARY'
        ? 'Stacjonarny'
        : 'Dojazd + Stacjonarny';

  const typeBadgeVariant =
    provider.type === 'MOBILE' ? 'accent' : provider.type === 'STATIONARY' ? 'info' : 'success';

  return (
    <View style={styles.screen}>
      <BackButton />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroText}>
            <Heading variant="h1" numberOfLines={2}>
              {provider.name}
            </Heading>
            {provider.tagline ? (
              <Text variant="body" color="textSecondary">
                {provider.tagline}
              </Text>
            ) : null}
            <View style={styles.badges}>
              <Badge label={typeLabel} variant={typeBadgeVariant} />
              {provider.avgRating > 0 ? (
                <RatingRow rating={provider.avgRating} count={provider.reviewCount} />
              ) : null}
            </View>
          </View>
        </View>

        {/* Opis */}
        {provider.description ? (
          <View style={styles.section}>
            <SectionHeader title="O warsztacie" />
            <Text variant="body" color="textSecondary" style={styles.description}>
              {provider.description}
            </Text>
          </View>
        ) : null}

        {/* Kontakt / lokalizacja */}
        <View style={styles.section}>
          <SectionHeader title="Kontakt" />
          <View style={styles.contactList}>
            {provider.type !== 'MOBILE' && provider.address ? (
              <View style={styles.contactRow}>
                <Text variant="bodySmall" color="textMuted" style={styles.contactLabel}>
                  Adres
                </Text>
                <Text variant="bodySmall" color="textPrimary">
                  {provider.address}
                </Text>
              </View>
            ) : null}
            {provider.type !== 'STATIONARY' ? (
              <View style={styles.contactRow}>
                <Text variant="bodySmall" color="textMuted" style={styles.contactLabel}>
                  Dojazd
                </Text>
                <Text variant="bodySmall" color="textPrimary">
                  Do {provider.serviceRadiusKm} km od centrum
                </Text>
              </View>
            ) : null}
            {provider.showPhone && provider.phone ? (
              <Pressable
                style={styles.contactRow}
                onPress={() => Linking.openURL(`tel:${provider.phone}`)}
              >
                <Text variant="bodySmall" color="textMuted" style={styles.contactLabel}>
                  Telefon
                </Text>
                <Text variant="bodySmall" color="accent">
                  {provider.phone}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Obsługiwane rozmiary */}
        {provider.tireSizes.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Rozmiary opon" />
            <Text variant="bodySmall" color="textSecondary">
              {provider.tireSizes.join(' · ')}
            </Text>
          </View>
        ) : null}

        {/* Ostatnie opinie */}
        {reviews && reviews.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader title="Opinie" />
            {reviews.slice(0, 3).map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text variant="bodySmall" weight="semibold" color="textPrimary">
                    {review.clientName}
                  </Text>
                  <Text variant="caption" color="warning">
                    {'★'.repeat(review.rating)}
                  </Text>
                </View>
                {review.comment ? (
                  <Text variant="bodySmall" color="textSecondary" numberOfLines={3}>
                    {review.comment}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.ctaSpace} />
      </ScrollView>

      {/* CTA */}
      <View style={styles.ctaBar}>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push(`/(app)/providers/${id}/slots` as never)}
        >
          Wybierz termin
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: t.colors.bg,
  },
  center: {
    flex: 1,
    backgroundColor: t.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing[4],
    padding: t.spacing[6],
  },
  backBtn: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: t.spacing[4],
  },
  hero: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[4],
    gap: t.spacing[3],
  },
  heroText: { gap: t.spacing[2] },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: t.spacing[2],
    marginTop: t.spacing[1],
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: t.spacing[2],
  },
  section: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
    borderTopWidth: 1,
    borderTopColor: t.colors.hairline,
    gap: t.spacing[2],
  },
  sectionHeader: {
    marginBottom: t.spacing[1],
    letterSpacing: 0.8,
  },
  description: { lineHeight: 22 },
  contactList: { gap: t.spacing[2] },
  contactRow: {
    flexDirection: 'row',
    gap: t.spacing[3],
  },
  contactLabel: { width: 60 },
  reviewCard: {
    backgroundColor: t.colors.surfaceRaised,
    borderRadius: t.radius.md,
    padding: t.spacing[3],
    gap: t.spacing[1],
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaSpace: { height: 96 },
  ctaBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: t.colors.bg,
    borderTopWidth: 1,
    borderTopColor: t.colors.hairline,
    padding: t.spacing[4],
    paddingBottom: t.spacing[6],
  },
});
