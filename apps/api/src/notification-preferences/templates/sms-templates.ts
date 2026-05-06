// ── Context types (shared with email templates) ───────────────────────────────

export type NewBookingCtx = {
  referenceCode: string;
  providerName: string;
};

export type CancelationCtx = {
  referenceCode: string;
  cancelledBy: 'CLIENT' | 'PROVIDER' | 'SYSTEM';
};

export type NewReviewCtx = {
  referenceCode: string;
  rating: number;
};

export type ReminderCtx = {
  referenceCode: string;
  startAt: string; // "HH:MM"
};

// ── SMS templates (max ~160 znaków) ──────────────────────────────────────────

export function newBookingSms(ctx: NewBookingCtx): string {
  return `[Opony.app] Nowa rezerwacja #${ctx.referenceCode}. Potwierdź w ciągu 15 min: panel.opony.app`;
}

export function cancelationSms(ctx: CancelationCtx): string {
  const who =
    ctx.cancelledBy === 'CLIENT'
      ? 'przez klienta'
      : ctx.cancelledBy === 'PROVIDER'
        ? 'przez warsztat'
        : 'automatycznie';
  return `[Opony.app] Rezerwacja #${ctx.referenceCode} anulowana ${who}.`;
}

export function newReviewSms(ctx: NewReviewCtx): string {
  const stars = '★'.repeat(ctx.rating) + '☆'.repeat(5 - ctx.rating);
  return `[Opony.app] Nowa opinia ${stars} · #${ctx.referenceCode}. Odpowiedz do 48h: panel.opony.app`;
}

export function reminderSms(ctx: ReminderCtx): string {
  return `[Opony.app] Przypomnienie: rezerwacja #${ctx.referenceCode} o ${ctx.startAt} (za ~30 min).`;
}
