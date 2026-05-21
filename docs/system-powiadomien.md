# System powiadomień — Opony.app

Dokumentacja szkieletu systemu powiadomień: konfiguracja preferencji, dispatcher eventów, kanały SMS i Email.

---

## 1. Architektura

```
[Zdarzenie domenowe]                   emitowane przez serwis domenowy
       │
       ▼
[NotificationDispatcherService]        nasłuchuje @OnEvent, ładuje prefs + dane providera
       │
       ├── [SmsChannelService]          wysyła SMS (teraz: Logger, docelowo: SMSAPI/Twilio)
       │       └── [notification-templates.ts]   builder treści SMS
       │
       ├── [EmailChannelService]        wysyła email (teraz: Logger, docelowo: Resend)
       │       └── [notification-templates.ts]   builder treści HTML + text
       │
       └── [PushChannelService]         wysyła Web Push przez VAPID (web-push)
               └── [push_subscriptions table]  → przeglądarka → /sw.js → showNotification()

[NotificationSchedulerService]         @Cron('*/5 * * * *') — przypomnienia 30 min przed wizytą
       │  (te same 3 kanały co Dispatcher)
       └── idempotencja: updateMany WHERE reminderSentAt IS NULL → skip jeśli 0 wierszy
```

Dispatcher i Scheduler nie decydują jak wysłać — delegują do kanałów. Kanały nie znają logiki biznesowej — dostają gotowy tekst z builderów szablonów.

---

## 2. Tabela `notification_preferences`

Jeden wiersz per provider. Tworzony automatycznie przy pierwszym `GET /v1/providers/me/notification-preferences` (`getOrCreate`).

```sql
notification_preferences (
  id               UUID PRIMARY KEY,
  provider_id      UUID UNIQUE NOT NULL,  -- jeden wiersz per provider

  -- Nowa rezerwacja (CRITICAL — co najmniej jeden kanał musi być ON)
  new_booking_sms    BOOLEAN DEFAULT true,
  new_booking_email  BOOLEAN DEFAULT false,
  new_booking_push   BOOLEAN DEFAULT true,

  -- Anulowanie rezerwacji (CRITICAL)
  cancelation_sms    BOOLEAN DEFAULT true,
  cancelation_email  BOOLEAN DEFAULT false,
  cancelation_push   BOOLEAN DEFAULT true,

  -- Przypomnienie 30 min przed wizytą
  reminder30_sms     BOOLEAN DEFAULT true,
  reminder30_email   BOOLEAN DEFAULT false,
  reminder30_push    BOOLEAN DEFAULT true,

  -- Nowa opinia od klienta
  new_review_sms     BOOLEAN DEFAULT false,
  new_review_email   BOOLEAN DEFAULT true,
  new_review_push    BOOLEAN DEFAULT true,

  -- Raport tygodniowy (brak push)
  weekly_report_sms    BOOLEAN DEFAULT false,
  weekly_report_email  BOOLEAN DEFAULT true,
  weekly_report_push   BOOLEAN DEFAULT false,

  -- Nowości w platformie (brak push)
  platform_news_sms    BOOLEAN DEFAULT false,
  platform_news_email  BOOLEAN DEFAULT false,
  platform_news_push   BOOLEAN DEFAULT false
)
```

---

## 3. API

| Metoda | Endpoint                                    | Opis                                                 |
| ------ | ------------------------------------------- | ---------------------------------------------------- |
| `GET`  | `/v1/providers/me/notification-preferences` | Pobiera preferencje (tworzy z defaultami jeśli brak) |
| `PUT`  | `/v1/providers/me/notification-preferences` | Upsert preferencji — przyjmuje częściowy obiekt      |

Oba endpointy wymagają JWT (`access_token` cookie), providerId w tokenie (`PROVIDER_OWNER`).

---

## 4. Eventy domenowe

### Zaimplementowane triggery

| Event class                 | Stała `EVENT`            | Kiedy odpala                   | Serwis                                                           |
| --------------------------- | ------------------------ | ------------------------------ | ---------------------------------------------------------------- |
| `BookingCreatedEvent`       | `booking.created`        | createManual — nowa rezerwacja | `bookings.service.ts`                                            |
| `BookingStatusChangedEvent` | `booking.status_changed` | Zmiana statusu rezerwacji      | `bookings.service.ts`                                            |
| `ReviewCreatedEvent`        | `review.created`         | Nowa opinia klienta            | _brak emittera — endpoint tworzenia opinii nie istnieje jeszcze_ |

### Mapowanie event → klucz preferencji

| Event                    | Warunek                                                                           | Klucz         |
| ------------------------ | --------------------------------------------------------------------------------- | ------------- |
| `booking.created`        | —                                                                                 | `newBooking`  |
| `booking.status_changed` | `newStatus` ∈ `{CANCELLED_BY_CLIENT, CANCELLED_BY_PROVIDER, CANCELLED_BY_SYSTEM}` | `cancelation` |
| `review.created`         | —                                                                                 | `newReview`   |

`CANCELLED_BY_*` jest mapowane na `cancelledBy: 'CLIENT' | 'PROVIDER' | 'SYSTEM'` przed przekazaniem do szablonu.

### Klasy eventów

```
apps/api/src/realtime/events/
  booking.events.ts     ← BookingCreatedEvent, BookingStatusChangedEvent, BookingBulkStatusChangedEvent
  review.events.ts      ← ReviewCreatedEvent  (nowy)
  worker-task.events.ts ← WorkerTaskCreatedEvent, WorkerTaskDeletedEvent
```

### Podpięcie ReviewCreatedEvent

Gdy zostanie dodany endpoint tworzenia opinii przez klienta, wystarczy w `ReviewsService`:

```typescript
constructor(
  private readonly reviewsRepository: ReviewsRepository,
  private readonly eventEmitter: EventEmitter2,
) {}

// po zapisaniu opinii w bazie:
this.eventEmitter.emit(
  ReviewCreatedEvent.EVENT,
  new ReviewCreatedEvent(review.providerId, review.id, review.booking.referenceCode, review.rating),
);
```

Dispatcher już nasłuchuje — handler `onReviewCreated` gotowy.

---

## 5. Dispatcher

**Plik:** `apps/api/src/notification-preferences/notification-dispatcher.service.ts`

Dla każdego eventu:

1. Ładuje równolegle preferencje (`NotificationPreferencesRepository.getOrCreate`) i dane providera (`prisma.provider.findUnique → { name, phone, email }`)
2. Sprawdza które kanały są włączone dla danego klucza
3. Buduje treść za pomocą buildera szablonu
4. Wywołuje `SmsChannelService.send()` i/lub `EmailChannelService.send()`
5. Dla Push — loguje do konsoli (stub)

Błąd ładowania danych jest przechwytywany (`try/catch`) — event nie blokuje przepływu głównego.

Push wysyłany jest przez `PushChannelService.send(providerId, title, body)` — nie jest to stub.

---

## 6. Kanały

### SmsChannelService

**Plik:** `apps/api/src/notification-preferences/channels/sms-channel.service.ts`

Teraz loguje do konsoli:

```
[SmsChannel] TO: +48 600 100 200
[SmsChannel] MSG: [Opony.app] Nowa rezerwacja #ABC123. Potwierdź w ciągu 15 min: panel.opony.app
```

Docelowo: wstrzyknąć adapter SMSAPI/Twilio i wywołać `adapter.send(phone, message)`.

### EmailChannelService

**Plik:** `apps/api/src/notification-preferences/channels/email-channel.service.ts`

Teraz loguje do konsoli:

```
[EmailChannel] TO: warsztat@example.com
[EmailChannel] SUBJECT: Nowa rezerwacja #ABC123 — Opony.app
[EmailChannel] TEXT: Hej, Automax Kraków! ...
```

Docelowo: `Resend.emails.send({ from, to, subject: content.subject, html: content.html })`.

**Uwaga:** `EmailChannelService` jest osobnym serwisem od `EmailService` (który obsługuje emaile transakcyjne: weryfikacja, zatwierdzenie konta). Nie mieszaj ich.

### PushChannelService

**Plik:** `apps/api/src/notification-preferences/channels/push-channel.service.ts`

Używa biblioteki `web-push` z kluczami VAPID z `ConfigService` (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`). Jeśli klucze nie są skonfigurowane — graceful degradation (loguje ostrzeżenie, nie wysyła).

```typescript
send(providerId: string, title: string, body: string): Promise<void>
// → PushSubscriptionsRepository.findByProvider(providerId)
// → dla każdej subskrypcji: webpush.sendNotification(sub, JSON.stringify({ title, body }))
// → HTTP 410/404 od przeglądarki → auto-delete wygasłej subskrypcji
```

Subskrypcja jest tworzona po stronie FE przez `usePushSubscription` hook i rejestrowana przez `POST /v1/providers/me/push-subscriptions`.

---

## 6a. Push Subscriptions — moduł

**Plik:** `apps/api/src/push-subscriptions/`

| Plik                               | Rola                                                                                                             |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `push-subscriptions.module.ts`     | Eksportuje `PushSubscriptionsRepository` — importowany przez `NotificationPreferencesModule`                     |
| `push-subscriptions.controller.ts` | `POST /v1/providers/me/push-subscriptions` (register), `DELETE /v1/providers/me/push-subscriptions` (unregister) |
| `push-subscriptions.repository.ts` | `upsert`, `deleteByEndpoint`, `findByProvider`                                                                   |

Klucz unikalności: `@@unique([providerId, endpoint])` — ta sama przeglądarka nie tworzy duplikatów.

**Ważne:** `PushSubscriptionsModule` jest importowany **wyłącznie** w `NotificationPreferencesModule` — nie dodawaj go bezpośrednio do `AppModule` (patrz: developer-guide.md §5 anti-pattern).

---

## 6b. NotificationSchedulerService — cron przypomnienia

**Plik:** `apps/api/src/notification-preferences/notification-scheduler.service.ts`

Uruchamia się co 5 minut (`@Cron('*/5 * * * *')`). Okno wyszukiwania: `startAt ∈ [now+25min, now+35min]` — każda rezerwacja trafia w to okno dokładnie raz przy prawidłowym działaniu crona.

### Idempotencja (wzorzec "claim before send")

`reminderSentAt` jest ustawiany **przed** wysłaniem:

```typescript
// 1. Atomiczne przejęcie — tylko jeden runner przejmie dany wiersz
const claimed = await this.prisma.booking.updateMany({
  where: { id: booking.id, reminderSentAt: null },
  data: { reminderSentAt: new Date() },
});
if (claimed.count === 0) continue; // inna instancja już wysłała

// 2. Dopiero teraz wysyłamy
await this.sendReminderFor(...);
```

**Dlaczego tak?** Ustawienie `reminderSentAt` po wysyłaniu tworzy race condition: jeśli dwie instancje crona uruchomią się równolegle (np. podczas deployu), obie pobiorą ten sam wiersz i wyślą podwójne powiadomienie. `updateMany` z warunkiem `reminderSentAt: null` jest atomiczne na poziomie bazy — tylko jedna instancja dostaje `count: 1`.

**Wzorzec ogólny:** zawsze używaj "claim before send" dla operacji, które powinny wystąpić dokładnie raz i mogą być uruchamiane przez wiele instancji.

---

## 7. Szablony

**Plik:** `apps/api/src/notification-preferences/templates/notification-templates.ts`

Czyste funkcje TypeScript — zero DI, zero side effects, łatwe do testowania jednostkowego.

### Typy kontekstu

```typescript
type NewBookingCtx = { referenceCode: string; providerName: string };
type CancelationCtx = { referenceCode: string; cancelledBy: 'CLIENT' | 'PROVIDER' | 'SYSTEM' };
type NewReviewCtx = { referenceCode: string; rating: number };
type EmailContent = { subject: string; text: string; html: string };
```

### Builderów SMS (max ~160 znaków)

| Funkcja               | Przykładowy wynik                                                                |
| --------------------- | -------------------------------------------------------------------------------- |
| `newBookingSms(ctx)`  | `[Opony.app] Nowa rezerwacja #ABC123. Potwierdź w ciągu 15 min: panel.opony.app` |
| `cancelationSms(ctx)` | `[Opony.app] Rezerwacja #ABC123 anulowana przez klienta.`                        |
| `newReviewSms(ctx)`   | `[Opony.app] Nowa opinia ★★★★☆ · #ABC123. Odpowiedz do 48h: panel.opony.app`     |

### Builderów Email

| Funkcja                 | Subject                                     |
| ----------------------- | ------------------------------------------- |
| `newBookingEmail(ctx)`  | `Nowa rezerwacja #ABC123 — Opony.app`       |
| `cancelationEmail(ctx)` | `Anulowanie rezerwacji #ABC123 — Opony.app` |
| `newReviewEmail(ctx)`   | `Nowa opinia ★★★★☆ — Opony.app`             |

Każda funkcja email zwraca `{ subject, text, html }` — `html` zawiera pełny template HTML inline-stylowany (spójny z `email.templates.ts`), `text` to fallback plain-text.

---

## 8. Frontend — ustawienia powiadomień

**Strona:** `/dashboard/settings` → sekcja `03 Powiadomienia`

### Macierz zdarzeń × kanałów

| Zdarzenie            | SMS | Email | Push |
| -------------------- | --- | ----- | ---- |
| Nowa rezerwacja ✦    | ☑   | ☐     | ☑    |
| Anulowanie ✦         | ☑   | ☐     | ☑    |
| Przypomnienie 30 min | ☑   | ☐     | ☑    |
| Nowa opinia          | ☐   | ☑     | ☑    |
| Raport tygodniowy    | ☐   | ☑     | —    |
| Nowości w platformie | ☐   | ☐     | —    |

✦ CRITICAL — UI blokuje wyłączenie wszystkich kanałów jednocześnie.  
— Push niedostępny dla danego zdarzenia (`PUSH_DISABLED` set).

### Przepływ danych

```
Montowanie strony
  └── useSWR('/v1/providers/me/notification-preferences', getNotificationPreferences)
        └── GET /v1/providers/me/notification-preferences
              └── NotificationPreferencesRepository.getOrCreate(providerId)

Klik na Toggle (kanał SMS / Email)
  └── toggleNotif(key, channel)
        ├── Walidacja CRITICAL (nie można wyłączyć wszystkich kanałów jednocześnie)
        ├── Buduje nowy stan
        ├── mutateNotifPrefs(updateNotificationPreferences(newPrefs), { optimisticData })
        │     └── PUT /v1/providers/me/notification-preferences
        └── Rollback na błąd (rollbackOnError: true)

Klik na Toggle (kanał Push — włączenie)
  └── toggleNotif(key, 'push', newVal=true)
        ├── Guard: pushPermission === 'unsupported' | 'denied' → return (nic nie rób)
        ├── pushPermission !== 'granted' → subscribePush()
        │     └── navigator.serviceWorker.register('/sw.js')
        │     └── pushManager.subscribe({ applicationServerKey: VAPID_PUBLIC_KEY })
        │     └── POST /v1/providers/me/push-subscriptions
        │     └── false → return (odmowa lub błąd — toggle nie zmienia się)
        └── (jak wyżej) mutateNotifPrefs(...)

Klik na Toggle (kanał Push — wyłączenie)
  └── toggleNotif(key, 'push', newVal=false)
        ├── Sprawdź czy to OSTATNI włączony toggle push (allPushOff)
        ├── allPushOff → unsubscribePush()
        │     └── DELETE /v1/providers/me/push-subscriptions
        │     └── sub.unsubscribe() (browser API)
        └── (jak wyżej) mutateNotifPrefs(...)
```

### Stany pushPermission

| Wartość         | Znaczenie                     | Zachowanie                                 |
| --------------- | ----------------------------- | ------------------------------------------ |
| `'default'`     | Użytkownik nie podjął decyzji | `subscribe()` pokazuje dialog przeglądarki |
| `'granted'`     | Pozwolenie przyznane          | Tylko rejestracja subskrypcji, bez dialogu |
| `'denied'`      | Użytkownik zablokował         | Toggle push jest nieprzechodny (return)    |
| `'unsupported'` | Przeglądarka bez API Push     | Toggle push wyłączony w UI (`disabled`)    |

### Pliki

| Plik                                                     | Rola                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------------- |
| `apps/panel/api-data-access/notification-preferences.ts` | `getNotificationPreferences()`, `updateNotificationPreferences(dto)` |
| `apps/panel/api-data-access/push-subscriptions.ts`       | `registerPushSubscription(dto)`, `unregisterPushSubscription(dto)`   |
| `apps/panel/lib/hooks/use-push-subscription.ts`          | Hook: `{ permission, loading, subscribe, unsubscribe }`              |
| `apps/panel/public/sw.js`                                | Service Worker: obsługuje `push` event → `showNotification()`        |
| `apps/panel/app/dashboard/settings/page.tsx`             | SWR hook, `prefsToState()`, `stateToPrefs()`, `toggleNotif()`        |

---

## 9. Struktura modułu

```
apps/api/src/notification-preferences/
  channels/
    sms-channel.service.ts
    email-channel.service.ts
    push-channel.service.ts
  templates/
    notification-templates.ts
  dto/
    notification-preferences-response.dto.ts
    update-notification-preferences.dto.ts
  notification-dispatcher.service.ts
  notification-scheduler.service.ts
  notification-preferences.controller.ts
  notification-preferences.module.ts       ← importuje PushSubscriptionsModule
  notification-preferences.repository.ts
  notification-preferences.service.ts

apps/api/src/push-subscriptions/
  push-subscriptions.module.ts             ← eksportuje PushSubscriptionsRepository
  push-subscriptions.controller.ts
  push-subscriptions.repository.ts
  dto/
    push-subscription-response.dto.ts

apps/panel/
  public/sw.js                             ← Service Worker: push handler
  api-data-access/
    notification-preferences.ts
    push-subscriptions.ts
  lib/hooks/
    use-push-subscription.ts
```

---

## 10. Co zostaje do zrobienia (backlog)

| #   | Co                                                                                            | Gdzie                                   |
| --- | --------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | Podpiąć adapter SMS (SMSAPI / Twilio)                                                         | `SmsChannelService.send()`              |
| 2   | Podpiąć Resend w `EmailChannelService`                                                        | `EmailChannelService.send()`            |
| 3   | Dodać emit `ReviewCreatedEvent` po dodaniu endpointu tworzenia opinii                         | `reviews.service.ts`                    |
| 4   | Cron — raport tygodniowy (poniedziałek 08:00)                                                 | `NotificationSchedulerService`          |
| 5   | Walidacja CRITICAL na backendzie (DTO validator — co najmniej 1 kanał ON dla klucza CRITICAL) | `UpdateNotificationPreferencesDto`      |
| 6   | Geolokalizacja IP w sesjach                                                                   | patrz `backlog-techniczny.md` → TECH-01 |
