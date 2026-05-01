import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/placeholder', () => {
    return HttpResponse.json({ message: 'MSW placeholder' });
  }),
];
