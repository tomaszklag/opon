import type { CancelationCtx, NewBookingCtx, NewReviewCtx, ReminderCtx } from './sms-templates';

export type { CancelationCtx, NewBookingCtx, NewReviewCtx, ReminderCtx };

export type EmailContent = {
  subject: string;
  text: string;
  html: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const BASE_STYLE = `
  font-family: Arial, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  color: #1a1a1a;
`;

const FOOTER = `
  <hr style="border: none; border-top: 1px solid #ddd; margin: 32px 0;" />
  <p style="font-size: 12px; color: #888;">Opony.app — platforma wymiany opon</p>
`;

const PANEL_BTN = (label: string) =>
  `<p style="margin: 32px 0;">
    <a href="https://panel.opony.app"
       style="background-color: #e63946; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
      ${label}
    </a>
  </p>`;

// ── Email templates ───────────────────────────────────────────────────────────

export function newBookingEmail(ctx: NewBookingCtx): EmailContent {
  const subject = `Nowa rezerwacja #${ctx.referenceCode} — Opony.app`;
  const text = [
    `Hej, ${ctx.providerName}!`,
    ``,
    `Klient złożył nową rezerwację #${ctx.referenceCode}.`,
    `Zaloguj się do panelu, aby ją potwierdzić. Masz na to 15 minut — po tym czasie rezerwacja wygaśnie.`,
    ``,
    `Panel: https://panel.opony.app`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8" /><title>${subject}</title></head>
<body style="${BASE_STYLE}">
  <h1 style="font-size: 22px; margin-bottom: 8px;">Nowa rezerwacja</h1>
  <p style="font-size: 14px; color: #888; margin-bottom: 24px;">Rezerwacja #<strong>${ctx.referenceCode}</strong></p>
  <p>Hej, <strong>${ctx.providerName}</strong>!</p>
  <p>Klient złożył nową rezerwację w Twoim warsztacie.</p>
  <p>Zaloguj się do panelu i potwierdź rezerwację w ciągu <strong>15 minut</strong> — po tym czasie slot wróci do puli.</p>
  ${PANEL_BTN('Otwórz panel i potwierdź')}
  ${FOOTER}
</body>
</html>`;

  return { subject, text, html };
}

export function cancelationEmail(ctx: CancelationCtx): EmailContent {
  const whoLabel =
    ctx.cancelledBy === 'CLIENT'
      ? 'przez klienta'
      : ctx.cancelledBy === 'PROVIDER'
        ? 'przez warsztat'
        : 'automatycznie przez system';
  const subject = `Anulowanie rezerwacji #${ctx.referenceCode} — Opony.app`;
  const text = [
    `Rezerwacja #${ctx.referenceCode} została anulowana ${whoLabel}.`,
    `Slot wrócił do kalendarza i jest znowu dostępny.`,
    ``,
    `Panel: https://panel.opony.app`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8" /><title>${subject}</title></head>
<body style="${BASE_STYLE}">
  <h1 style="font-size: 22px; margin-bottom: 8px;">Anulowanie rezerwacji</h1>
  <p style="font-size: 14px; color: #888; margin-bottom: 24px;">Rezerwacja #<strong>${ctx.referenceCode}</strong></p>
  <p>Rezerwacja <strong>#${ctx.referenceCode}</strong> została anulowana ${whoLabel}.</p>
  <p>Slot wrócił do kalendarza i jest ponownie dostępny dla klientów.</p>
  ${PANEL_BTN('Otwórz kalendarz')}
  ${FOOTER}
</body>
</html>`;

  return { subject, text, html };
}

export function newReviewEmail(ctx: NewReviewCtx): EmailContent {
  const stars = '★'.repeat(ctx.rating) + '☆'.repeat(5 - ctx.rating);
  const subject = `Nowa opinia ${stars} — Opony.app`;
  const text = [
    `Klient wystawił nową opinię ${ctx.rating}/5 dla rezerwacji #${ctx.referenceCode}.`,
    `Szybka odpowiedź (do 48h) zwiększa widoczność warsztatu w wynikach wyszukiwania.`,
    ``,
    `Panel: https://panel.opony.app`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8" /><title>${subject}</title></head>
<body style="${BASE_STYLE}">
  <h1 style="font-size: 22px; margin-bottom: 8px;">Nowa opinia od klienta</h1>
  <p style="font-size: 14px; color: #888; margin-bottom: 24px;">Rezerwacja #<strong>${ctx.referenceCode}</strong></p>
  <p style="font-size: 32px; letter-spacing: 2px; margin: 16px 0;">${stars}</p>
  <p>Ocena: <strong>${ctx.rating}/5</strong></p>
  <p>Szybka odpowiedź w ciągu <strong>48 godzin</strong> zwiększa widoczność Twojego warsztatu w wynikach wyszukiwania.</p>
  ${PANEL_BTN('Odpowiedz na opinię')}
  ${FOOTER}
</body>
</html>`;

  return { subject, text, html };
}

export function reminderEmail(ctx: ReminderCtx): EmailContent {
  const subject = `Przypomnienie: rezerwacja #${ctx.referenceCode} o ${ctx.startAt} — Opony.app`;
  const text = `Rezerwacja #${ctx.referenceCode} zaczyna się o ${ctx.startAt} (za około 30 minut). Zaloguj się do panelu, aby sprawdzić szczegóły.`;
  const html = `<!DOCTYPE html>
<html lang="pl">
<head><meta charset="UTF-8" /><title>${subject}</title></head>
<body style="${BASE_STYLE}">
  <h1 style="font-size: 22px; margin-bottom: 8px;">Przypomnienie o rezerwacji</h1>
  <p style="font-size: 14px; color: #888; margin-bottom: 24px;">Rezerwacja #<strong>${ctx.referenceCode}</strong></p>
  <p>Rezerwacja zaczyna się o <strong>${ctx.startAt}</strong> — za około 30 minut.</p>
  ${PANEL_BTN('Otwórz kalendarz')}
  ${FOOTER}
</body>
</html>`;
  return { subject, text, html };
}
