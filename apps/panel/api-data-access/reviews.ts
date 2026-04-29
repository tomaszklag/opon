import { api } from '../lib/api';

// Typy tymczasowo zdefiniowane ręcznie — po restarcie API z ReviewsModule
// należy zastąpić: components['schemas']['ReviewResponseDto'] / ReviewStatsResponseDto
// z @opony/api-client (patrz developer-guide §3.5 i regeneracja schematu).

export interface ReviewDto {
  id: string;
  bookingReferenceCode: string;
  authorName: string;
  authorInitials: string;
  rating: number;
  comment: string | null;
  providerReply: string | null;
  providerRepliedAt: string | null;
  isReported: boolean;
  seenByProvider: boolean;
  createdAt: string;
}

export interface ReviewStatsDto {
  avgRating: number;
  totalCount: number;
  newCount: number;
  pendingReplyCount: number;
  repliedCount: number;
  reportedCount: number;
  replyRatePct: number;
  avgReplyTimeHours: number | null;
  ratingCounts: [number, number, number, number, number];
  lastThirtyDaysCount: number;
}

export type ReviewTab = 'all' | 'pending' | 'replied' | 'reported';
export type ReviewRatingFilter = '5' | '4' | 'lte3';

export interface ReviewListParams {
  tab?: ReviewTab;
  rating?: ReviewRatingFilter;
  sort?: 'newest' | 'oldest_pending';
}

function buildQuery(params: ReviewListParams): string {
  const q = new URLSearchParams();
  if (params.tab && params.tab !== 'all') q.set('tab', params.tab);
  if (params.rating) q.set('rating', params.rating);
  if (params.sort) q.set('sort', params.sort);
  const str = q.toString();
  return str ? `?${str}` : '';
}

export const reviewsApi = {
  list: (params: ReviewListParams = {}) =>
    api.get<ReviewDto[]>(`/v1/providers/me/reviews${buildQuery(params)}`),

  getStats: () => api.get<ReviewStatsDto>('/v1/providers/me/reviews/stats'),

  upsertReply: (id: string, text: string) =>
    api.put<ReviewDto>(`/v1/providers/me/reviews/${id}/reply`, { text }),

  deleteReply: (id: string) => api.del<void>(`/v1/providers/me/reviews/${id}/reply`),

  report: (id: string) => api.post<void>(`/v1/providers/me/reviews/${id}/report`, {}),

  markSeen: () => api.post<void>('/v1/providers/me/reviews/mark-seen', {}),
};
