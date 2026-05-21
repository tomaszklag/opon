import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  t,
  Text,
  Heading,
  Button,
  Input,
  Spinner,
  EmptyState,
  useToast,
  StarRating,
} from '@opony/design-system-native';
import { useBooking } from '@/hooks/bookings/use-bookings';
import { useCreateReview } from '@/hooks/reviews/use-reviews';
import { ApiError } from '@/lib/error';

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

export default function RateScreen() {
  const { id, bookingId } = useLocalSearchParams<{ id: string; bookingId: string }>();
  const router = useRouter();
  const { show: showToast } = useToast();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: booking, isLoading, isError } = useBooking(bookingId);
  const { mutateAsync: submitReview, isPending } = useCreateReview();

  if (isError) {
    return (
      <View style={styles.screen}>
        <BackButton />
        <EmptyState
          title="Błąd"
          description="Nie udało się załadować szczegółów wizyty."
          ctaLabel="Wróć"
          onCtaPress={() => router.back()}
        />
      </View>
    );
  }

  if (isLoading || !booking) {
    return (
      <View style={styles.center}>
        <Spinner />
      </View>
    );
  }

  if (booking.status !== 'COMPLETED') {
    return (
      <View style={styles.screen}>
        <BackButton />
        <EmptyState
          title="Niedostępne"
          description="Nie można ocenić tej wizyty. Wizyta musi być zrealizowana, aby można ją ocenić."
          ctaLabel="Wróć"
          onCtaPress={() => router.back()}
        />
      </View>
    );
  }

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      await submitReview({
        bookingId,
        rating,
        comment: comment.trim() || undefined,
      });
      showToast('Dziękujemy za ocenę!', 'success');
      router.back();
    } catch (err) {
      const message = err instanceof ApiError ? err.getMessage() : 'Nie udało się wysłać oceny.';
      showToast(message, 'error');
    }
  };

  return (
    <View style={styles.screen}>
      <BackButton />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <Heading variant="h2">Oceń wizytę</Heading>
          <Text variant="bodySmall" color="textSecondary">
            {booking.provider.name}
          </Text>
        </View>

        <View style={styles.section}>
          <Text variant="label" color="textSecondary">
            TWOJA OCENA
          </Text>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </View>

        <View style={styles.section}>
          <Input
            label="Komentarz (opcjonalnie)"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={500}
            autoCapitalize="sentences"
            placeholder="Podziel się swoją opinią..."
          />
        </View>

        <View style={styles.section}>
          <Button
            variant="primary"
            size="md"
            fullWidth
            disabled={rating === 0}
            loading={isPending}
            onPress={handleSubmit}
          >
            Wyślij ocenę
          </Button>
        </View>
      </ScrollView>
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
  scroll: { flex: 1 },
  scrollContent: {
    paddingBottom: t.spacing[8],
  },
  section: {
    paddingHorizontal: t.spacing[4],
    paddingVertical: t.spacing[4],
    borderTopWidth: 1,
    borderTopColor: t.colors.hairline,
    gap: t.spacing[3],
  },
});
