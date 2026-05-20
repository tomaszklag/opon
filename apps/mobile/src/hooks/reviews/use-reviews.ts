import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReviews, createReview, type CreateReviewDto } from '@/api/reviews';
import { QUERY_KEYS } from '@/constants/query-keys';

export function useReviews(providerId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.byProvider(providerId),
    queryFn: () => getReviews(providerId),
    enabled: !!providerId,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReviewDto) => createReview(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}
