import { setupServer } from 'msw/native';
import { authHandlers } from './handlers/auth';
import { usersHandlers } from './handlers/users';
import { providersHandlers } from './handlers/providers';
import { bookingsHandlers } from './handlers/bookings';
import { reviewsHandlers } from './handlers/reviews';

export const server = setupServer(
  ...authHandlers,
  ...usersHandlers,
  ...providersHandlers,
  ...bookingsHandlers,
  ...reviewsHandlers,
);
