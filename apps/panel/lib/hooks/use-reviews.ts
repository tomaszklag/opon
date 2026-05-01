'use client';
import useSWR from 'swr';
import { reviewsApi, type ReviewListParams } from '../../api-data-access/reviews';

export function useReviews(params: ReviewListParams) {
  const key = ['reviews', params.tab ?? 'all', params.rating ?? '', params.sort ?? ''];
  const { data, error, isLoading, mutate } = useSWR(key, () => reviewsApi.list(params), {
    revalidateOnFocus: false,
  });
  return { reviews: data ?? [], isLoading, error, mutate };
}

export function useReviewStats() {
  const { data, error, isLoading, mutate } = useSWR('review-stats', () => reviewsApi.getStats(), {
    revalidateOnFocus: false,
  });
  return { stats: data ?? null, isLoading, error, mutate };
}
