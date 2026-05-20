import React from 'react';
import { View, FlatList, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  t,
  Text,
  Heading,
  Spinner,
  EmptyState,
  Card,
  StarRating,
} from '@opony/design-system-native';
import { useReviews } from '@/hooks/reviews/use-reviews';
import type { AppReview } from '@/api/reviews';

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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function ReviewCard({ review }: { review: AppReview }) {
  const authorName = review.author.firstName ?? 'Anonim';
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <StarRating value={review.rating} size="sm" />
        <Text variant="caption" color="textMuted">
          {formatDate(review.createdAt)}
        </Text>
      </View>
      {review.comment ? (
        <Text variant="bodySmall" color="textSecondary">
          {review.comment}
        </Text>
      ) : null}
      <Text variant="caption" color="textMuted" weight="medium">
        {authorName}
      </Text>
    </Card>
  );
}

function calcAverage(reviews: AppReview[]): string {
  if (reviews.length === 0) return '—';
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: reviews, isLoading, isError, refetch } = useReviews(id);

  if (isError) {
    return (
      <View style={styles.screen}>
        <BackButton />
        <EmptyState
          title="Błąd"
          description="Nie udało się załadować opinii."
          ctaLabel="Spróbuj ponownie"
          onCtaPress={() => refetch()}
        />
      </View>
    );
  }

  if (isLoading || !reviews) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  const avg = calcAverage(reviews);

  return (
    <View style={styles.screen}>
      <BackButton />
      <View style={styles.headerRow}>
        <Heading variant="h2">Opinie</Heading>
        {reviews.length > 0 ? (
          <View style={styles.avgBadge}>
            <Text variant="body" weight="semibold" color="warning">
              {avg} ★
            </Text>
          </View>
        ) : null}
      </View>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ReviewCard review={item} />}
        ListEmptyComponent={
          <EmptyState
            title="Brak opinii"
            description="Ten warsztat nie ma jeszcze żadnych opinii."
          />
        }
      />
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
  },
  backBtn: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[3],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: t.colors.hairline,
    gap: t.spacing[3],
  },
  avgBadge: {
    backgroundColor: t.colors.warningMuted,
    borderRadius: t.radius.md,
    paddingHorizontal: t.spacing[3],
    paddingVertical: t.spacing[1],
  },
  listContent: {
    padding: t.spacing[4],
    gap: t.spacing[3],
    flexGrow: 1,
  },
  card: {
    gap: t.spacing[2],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing[2],
  },
});
