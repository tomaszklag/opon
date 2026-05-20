import { api } from './client';

// TODO: replace with components['schemas']['AppReviewResponseDto'] after BE implementation
export interface AppReview {
  id: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: {
    firstName: string | null;
  };
}

// TODO: replace with components['schemas']['CreateAppReviewDto'] after BE implementation
export interface CreateReviewDto {
  bookingId: string;
  rating: number;
  comment?: string;
}

export const getReviews = (providerId: string): Promise<AppReview[]> =>
  api.get<AppReview[]>(`/v1/app/providers/${providerId}/reviews`);

export const createReview = (dto: CreateReviewDto): Promise<AppReview> =>
  api.post<AppReview>('/v1/app/reviews', dto);
