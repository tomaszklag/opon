export const QUERY_KEYS = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  vehicles: {
    all: ['vehicles', 'all'] as const,
  },
  providers: {
    all: ['providers'] as const,
    list: (params: object) => ['providers', 'list', params] as const,
    detail: (id: string) => ['providers', 'detail', id] as const,
    slots: (id: string, date: string) => ['providers', 'slots', id, date] as const,
    reviews: (id: string) => ['providers', 'reviews', id] as const,
  },
  bookings: {
    all: ['bookings'] as const,
    list: (status?: string) => ['bookings', 'list', status] as const,
    detail: (id: string) => ['bookings', 'detail', id] as const,
  },
} as const;
