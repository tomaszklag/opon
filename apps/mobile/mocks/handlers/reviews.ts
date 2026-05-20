import { http, HttpResponse } from 'msw';

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

interface MockReview {
  id: string;
  bookingId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: {
    firstName: string | null;
  };
}

const mockReviews: MockReview[] = [
  {
    id: 'review-1',
    bookingId: 'booking-3',
    rating: 5,
    comment: 'Świetna obsługa, polecam!',
    createdAt: '2026-04-16T10:00:00.000Z',
    author: { firstName: 'Anna' },
  },
  {
    id: 'review-2',
    bookingId: 'booking-old-2',
    rating: 4,
    comment: null,
    createdAt: '2026-03-10T09:00:00.000Z',
    author: { firstName: null },
  },
];

let reviewIdCounter = mockReviews.length + 1;

export const reviewsHandlers = [
  http.get(`${BASE}/v1/app/providers/:providerId/reviews`, () => {
    return HttpResponse.json(mockReviews);
  }),

  http.post(`${BASE}/v1/app/reviews`, async ({ request }) => {
    const body = (await request.json()) as {
      bookingId: string;
      rating: number;
      comment?: string;
    };

    const newReview: MockReview = {
      id: `review-${++reviewIdCounter}`,
      bookingId: body.bookingId,
      rating: body.rating,
      comment: body.comment ?? null,
      createdAt: new Date().toISOString(),
      author: { firstName: null },
    };

    mockReviews.push(newReview);
    return HttpResponse.json(newReview, { status: 201 });
  }),
];
