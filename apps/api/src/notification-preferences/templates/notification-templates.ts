export type {
  NewBookingCtx,
  CancelationCtx,
  NewReviewCtx,
  ReminderCtx,
  RescheduleCtx,
} from './sms-templates';
export {
  newBookingSms,
  cancelationSms,
  newReviewSms,
  reminderSms,
  rescheduleSms,
} from './sms-templates';

export type { EmailContent } from './email-templates';
export {
  newBookingEmail,
  cancelationEmail,
  newReviewEmail,
  reminderEmail,
} from './email-templates';
