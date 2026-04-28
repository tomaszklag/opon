export function emailVerificationTemplate(link: string): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <title>Potwierdź adres email — Opony.app</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 22px; margin-bottom: 16px;">Potwierdź adres email</h1>
  <p>Dziękujemy za rejestrację w serwisie Opony.app.</p>
  <p>Aby aktywować konto, kliknij poniższy przycisk. Link jest ważny przez 24 godziny.</p>
  <p style="margin: 32px 0;">
    <a href="${link}"
       style="background-color: #e63946; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
      Potwierdź adres email
    </a>
  </p>
  <p>Jeśli nie możesz kliknąć przycisku, skopiuj poniższy adres do przeglądarki:</p>
  <p style="word-break: break-all; color: #555;">${link}</p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 32px 0;" />
  <p style="font-size: 12px; color: #888;">
    Jeśli nie zakładałeś konta w Opony.app, zignoruj tę wiadomość.
  </p>
</body>
</html>`;
}

export function submissionReceivedTemplate(providerName: string): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <title>Zgłoszenie przyjęte — Opony.app</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 22px; margin-bottom: 16px;">Zgłoszenie przyjęte</h1>
  <p>Cześć, <strong>${providerName}</strong>!</p>
  <p>Twoje zgłoszenie do weryfikacji zostało przyjęte przez nasz zespół.</p>
  <p>Weryfikacja trwa zazwyczaj do 2 dni roboczych. Po rozpatrzeniu zgłoszenia otrzymasz od nas kolejną wiadomość.</p>
  <p>W razie pytań skontaktuj się z nami: <a href="mailto:kontakt@opony.app">kontakt@opony.app</a></p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 32px 0;" />
  <p style="font-size: 12px; color: #888;">Opony.app — platforma wymiany opon</p>
</body>
</html>`;
}

export function accountApprovedTemplate(providerName: string): string {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <title>Konto zatwierdzone — Opony.app</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 22px; margin-bottom: 16px;">Konto zatwierdzone!</h1>
  <p>Cześć, <strong>${providerName}</strong>!</p>
  <p>Twoje konto zostało zweryfikowane i zatwierdzone. Możesz teraz w pełni korzystać z platformy Opony.app.</p>
  <p>Zaloguj się do panelu, aby skonfigurować swój profil i zacząć przyjmować zlecenia.</p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 32px 0;" />
  <p style="font-size: 12px; color: #888;">Opony.app — platforma wymiany opon</p>
</body>
</html>`;
}

export function accountRejectedTemplate(providerName: string, reason?: string): string {
  const reasonSection = reason ? `<p><strong>Powód odrzucenia:</strong></p><p>${reason}</p>` : '';

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <title>Zgłoszenie odrzucone — Opony.app</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
  <h1 style="font-size: 22px; margin-bottom: 16px;">Zgłoszenie odrzucone</h1>
  <p>Cześć, <strong>${providerName}</strong>!</p>
  <p>Z przykrością informujemy, że Twoje zgłoszenie do serwisu Opony.app zostało odrzucone.</p>
  ${reasonSection}
  <p>Jeśli uważasz, że nastąpiła pomyłka lub chcesz uzyskać więcej informacji, skontaktuj się z nami: <a href="mailto:kontakt@opony.app">kontakt@opony.app</a></p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 32px 0;" />
  <p style="font-size: 12px; color: #888;">Opony.app — platforma wymiany opon</p>
</body>
</html>`;
}
