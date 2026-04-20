# Architektura MVP v0 — Opony.app

> Jeden spójny dokument architektury dla MVP v0. Miasto pilotażowe: Nowy Sącz (~85k mieszkańców). Stack: Next.js + NestJS + PostgreSQL + Przelewy24. Zespół: 4 agentów AI pracujących równolegle w sprintach. Zakres: 139 SP MUST, 7 sprintów, ~7 tygodni.

---

## 1. Stack technologiczny (MVP v0)

| Warstwa | Technologia | Wersja | Uzasadnienie |
|---|---|---|---|
| Frontend klient | Next.js (App Router) + PWA manifest | 14+ | Skip App Store review (1–2 tyg.), szybki TTM, offline-capable via Service Worker |
| Frontend provider | Next.js (App Router) | 14+ | Desktop-first — providerzy wolą duży ekran, wspólna baza kodu z klientem |
| Frontend landing | Next.js (Static Export) | 14+ | SEO, szybki load, zero kosztu SSR |
| Backend API | NestJS (Node.js) | 10+ (Node 20+) | TypeScript end-to-end, Prisma ORM, Swagger auto-docs, Dependency Injection |
| ORM | Prisma | 5+ | Type-safe queries, deklaratywne migrations, seeding |
| Baza danych | PostgreSQL | 16 | Bez PostGIS w v0 — haversine w raw SQL wystarczy dla promienia. ACID, partial unique index |
| Płatności | Przelewy24 REST API v2 | — | Natywny BLIK (~70% PL e-commerce), 1,5% + 0,50 PLN, marketplace mode |
| SMS | Twilio (startup) → SMSAPI.pl (docelowy) | — | OTP, potwierdzenia, przypomnienia. Interface SmsService → swap via DI |
| Email | Resend | — | Notyfikacje, potwierdzenia, raporty, alerty admina. Free tier 3k/mc |
| Mapy | Google Maps JS API | — | Embed, geocoding, Places Autocomplete. $200/mc free credit |
| Storage | AWS S3 | — | Zdjecia providerów, dokumenty, certyfikaty. Presigned URLs |
| Monitoring | Sentry | — | Bledy + crashes, source maps, alerty |
| Analytics | PostHog (free tier) | — | Funnele konwersji, retention. Self-serve |
| Admin | Retool Cloud | — | CRUD na Postgres + REST API. Oszczednosc ~40+ SP |
| CI/CD | GitHub Actions | — | lint → test → build → deploy. Trunk-based development |
| Hosting | Railway (API + Postgres), Vercel (Next.js apps) | — | Zero DevOps, auto-scaling, preview deployments |
| Monorepo | Turborepo + pnpm | pnpm 9+ | Parallel builds, shared packages, cache |
| Testy | Vitest + Playwright + MSW | — | Unit/integration + E2E + API mocking |
| Dokumentacja API | Swagger (NestJS plugin) + Storybook | — | Auto-generated z decoratorow, component library |

**Czego NIE używamy w v0 (świadomie):**

| Technologia | Powod odrzucenia | Kiedy wejdzie |
|---|---|---|
| React Native / Expo | PWA wystarczy na walidacje modelu | v1 (po 100+ rez/mc) |
| PostGIS | Haversine wystarczy dla promienia | v1 (polygon stref) |
| Redis | Row lock w Postgres wystarczy | v1 (cache slotów, sessions) |
| WebSocket / SSE | Polling co 30s wystarczy dla ~200 rez/mc | v1 |
| Mapbox | Google Maps ma $200/mc free credit | v1 (3+ miast) |
| Stripe | P24 tańszy i ma natywny BLIK | v1 (karty zagraniczne, Apple/Google Pay) |
| Auth0 / Clerk | Własny JWT = zero kosztu SaaS, pełna kontrola | nigdy (chyba ze compliance) |
| CEPIK API | Reczne wpisanie rozmiaru opon w v0 | v1 (auto-fill z VIN) |
| Push notifications (FCM/APNs) | SMS wystarczy w v0 | v1 (RN app) |

---

## 2. Architektura wysokopoziomowa

### 2.1. Diagram komponentów (MVP v0)

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                     FRONTEND (Vercel)                    │
                    │                                                         │
                    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
                    │  │ Client PWA   │  │ Provider Web │  │   Landing    │  │
                    │  │ (Next.js 14) │  │ (Next.js 14) │  │ (Next.js 14) │  │
                    │  │ /apps/client │  │/apps/provider│  │/apps/landing │  │
                    │  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
                    │         │                  │                             │
                    └─────────┼──────────────────┼────────────────────────────┘
                              │ REST/JSON        │ REST/JSON
                              │ Bearer JWT       │ Bearer JWT
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┐│┌──────────────────┐
                    │  Sentry          │││  PostHog         │
                    │  (all apps)      │││  (all apps)      │
                    └──────────────────┘│└──────────────────┘
                                       │
                              ┌────────▼─────────┐
                              │    NestJS API     │
                              │   (Railway)       │
                              │   /apps/api       │
                              └────────┬──────────┘
                                       │
              ┌────────┬───────┬───────┼────────┬─────────┬──────────┐
              │        │       │       │        │         │          │
         ┌────▼───┐ ┌──▼──┐ ┌─▼──┐ ┌──▼───┐ ┌──▼───┐ ┌──▼───┐ ┌───▼────┐
         │Postgres│ │Twilio│ │ S3 │ │ P24  │ │Resend│ │Google│ │GUS/    │
         │  16    │ │(SMS) │ │    │ │      │ │      │ │ Maps │ │CEIDG   │
         └────────┘ └─────┘ └────┘ └──────┘ └──────┘ └──────┘ └────────┘

              ┌──────────────────┐
              │  Retool Cloud    │──── PostgreSQL (read) + NestJS API (write)
              │  (admin panel)   │
              └──────────────────┘
```

### 2.2. Deployment topology (Railway + Vercel)

```
                         ┌──────────────── DNS ─────────────────┐
                         │                                      │
                         │  opony.app         → Vercel (landing)│
                         │  client.opony.app  → Vercel (PWA)    │
                         │  provider.opony.app→ Vercel (B2B)    │
                         │  api.opony.app     → Railway (API)   │
                         └──────────────────────────────────────┘

┌─── Vercel ──────────────────────────────┐  ┌─── Railway ────────────────────┐
│                                         │  │                                │
│  ┌──────────┐ ┌───────────┐ ┌────────┐  │  │  ┌──────────┐  ┌───────────┐  │
│  │  Client  │ │ Provider  │ │Landing │  │  │  │ NestJS   │  │PostgreSQL │  │
│  │  PWA     │ │   Web     │ │ Static │  │  │  │ API      │  │   16      │  │
│  │:3000     │ │  :3001    │ │ :3002  │  │  │  │ :4000    │  │  :5432    │  │
│  └──────────┘ └───────────┘ └────────┘  │  │  └──────────┘  └───────────┘  │
│                                         │  │                                │
│  Edge Functions, CDN, Preview Deploys   │  │  Auto-restart, Logging, Cron   │
└─────────────────────────────────────────┘  └────────────────────────────────┘

┌─── External Services ──────────────────────────────────────────────────────┐
│                                                                            │
│  Twilio (SMS)          │  AWS S3 eu-central-1 (storage)                    │
│  Przelewy24 (płatności)│  Resend (email)                                   │
│  Sentry (monitoring)   │  PostHog (analytics)                              │
│  Google Maps (mapy)    │  GUS BIR / CEIDG (weryfikacja NIP)               │
│  Retool Cloud (admin)  │                                                   │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.3. Komunikacja między serwisami

| From → To | Protocol | Auth | Uwagi |
|---|---|---|---|
| Client PWA → API | REST/JSON (HTTPS) | Bearer JWT (access 15 min) | Polling co 30s dla slotów dostępnośći |
| Provider Web → API | REST/JSON (HTTPS) | Bearer JWT (access 15 min) | — |
| Landing → API | Brak (statyczny) | — | Formularz waitlist → POST /v1/waitlist |
| API → PostgreSQL | Prisma Client | Connection string | Connection pool (Railway managed) |
| API → Twilio | HTTPS (Twilio SDK) | env TWILIO_SID + TWILIO_AUTH_TOKEN | Sender ID: „OPONY" |
| API → Przelewy24 | HTTPS REST API v2 | env P24_MERCHANT_ID + P24_API_KEY + P24_CRC | Redirect flow |
| API → S3 | AWS SDK v3 | env AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY | Presigned URLs (upload + download) |
| API → Resend | HTTPS (Resend SDK) | env RESEND_API_KEY | Domena: opony.app (SPF/DKIM/DMARC) |
| API → Google Maps | HTTPS | env GOOGLE_MAPS_API_KEY | Geocoding + Places Autocomplete (server-side) |
| API → GUS/CEIDG | HTTPS REST | env GUS_API_KEY | Weryfikacja NIP przy onboardingu |
| P24 → API | Webhook POST /v1/webhooks/p24 | P24_CRC signature verification | Potwierdzenie/odrzucenie płatności |
| Twilio → API | Webhook POST /v1/webhooks/twilio | Twilio signature verification | Delivery reports SMS |
| Retool → PostgreSQL | Direct connection (read-only user) | DB credentials | Dashboardy, raporty SQL |
| Retool → API | REST/JSON | Admin JWT / API key | Akcje: approve/reject/suspend/ban |

---

## 3. Struktura monorepo

### 3.1. Drzewo plików

```
opony/
├── apps/
│   ├── api/                    — NestJS 10+ backend
│   │   ├── src/
│   │   │   ├── auth/           — OTP + JWT + guards
│   │   │   ├── user/           — profil klienta
│   │   │   ├── vehicle/        — pojazdy klienta
│   │   │   ├── provider/       — onboarding + GUS
│   │   │   ├── provider-panel/ — dashboard + CRUD
│   │   │   ├── catalog/        — listing providerów
│   │   │   ├── availability/   — generowanie slotów
│   │   │   ├── booking/        — rezerwacje + state machine
│   │   │   ├── payment/        — P24 integration
│   │   │   ├── review/         — oceny + moderacja
│   │   │   ├── upload/         — S3 presigned URLs
│   │   │   ├── sms/            — Twilio/SMSAPI service
│   │   │   ├── email/          — Resend service
│   │   │   ├── admin/          — admin endpoints
│   │   │   ├── cron/           — scheduled jobs
│   │   │   └── common/         — filters, interceptors, pipes
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── test/
│   ├── client/                 — Next.js PWA (klient)
│   │   ├── app/
│   │   │   ├── (auth)/         — login, OTP, consent
│   │   │   └── (main)/         — search, booking, profile
│   │   ├── components/
│   │   ├── lib/
│   │   └── mocks/              — MSW handlers
│   ├── provider/               — Next.js (panel B2B)
│   │   ├── app/
│   │   │   ├── (auth)/         — login, reset, blocked
│   │   │   ├── (onboarding)/   — signup wizard
│   │   │   └── (main)/         — dashboard, pricing, etc.
│   │   ├── components/
│   │   └── mocks/
│   └── landing/                — Next.js static
│       ├── app/
│       │   ├── page.tsx        — hero + CTA + waitlist
│       │   └── layout.tsx
│       └── components/
├── packages/
│   ├── shared-types/           — TS interfaces + enums
│   ├── design-system/          — 10 base components + Storybook
│   ├── design-tokens/          — JSON (colors, spacing, typography)
│   ├── api-client/             — typed fetch from OpenAPI
│   └── eslint-config/          — shared ESLint rules
├── e2e/                        — Playwright tests
├── docker-compose.yml          — Postgres 16 + Mailpit
├── turbo.json                  — pipeline config
├── pnpm-workspace.yaml
├── .env.example
└── .github/
    └── workflows/
        └── ci.yml              — lint → test → build → deploy
```

### 3.2. Opis pakietów

| Pakiet | Sciezka | Odpowiedzialność |
|---|---|---|
| **shared-types** | `/packages/shared-types` | Współdzielone interfejsy TS i enumy (BookingStatus, ProviderStatus, UserRole, DTO types). Importowane przez api, client, provider, api-client. |
| **design-system** | `/packages/design-system` | 10 bazowych komponentów UI (Button, Input, Badge, Card, Modal, BottomTabBar, SideMenu, Spinner, Toast, EmptyState) + Storybook. Importowane przez client, provider, landing. |
| **design-tokens** | `/packages/design-tokens` | JSON z tokenami designu (colors, spacing, radii, typography, shadows). Źródło prawdy dla design-system i wszystkich frontendow. |
| **api-client** | `/packages/api-client` | Typed fetch wrapper generowany z OpenAPI spec (Swagger). Zapewnia type-safe wywolania API w client i provider. |
| **eslint-config** | `/packages/eslint-config` | Wspoldzielona konfiguracja ESLint + Prettier. Rozszerza eslint-config-next + custom rules. |

---

## 4. Setup guide — od zera do running dev

### 4.1. Wymagania systemowe

| Narzedzie | Wersja | Uwagi |
|---|---|---|
| Node.js | 20+ (LTS) | Wymagane przez NestJS 10 i Next.js 14 |
| pnpm | 9+ | Monorepo workspace manager |
| Docker Desktop | Latest | Dla Postgres 16 + Mailpit (lokalny email preview) |
| Git | 2.40+ | — |

### 4.2. Pierwsze uruchomienie

```bash
# 1. Klonowanie i konfiguracja
git clone <repo-url> && cd opony
cp .env.example .env.local

# 2. Instalacja zależności
pnpm install

# 3. Uruchomienie usług (Postgres 16 + Mailpit)
docker compose up -d

# 4. Migracje bazy danych
pnpm db:migrate

# 5. Seed danych testowych (5 providerów + 20 rezerwacji)
pnpm db:seed

# 6. Uruchomienie wszystkich 4 aplikacji równolegle
pnpm dev
```

### 4.3. Dostep po uruchomieniu

| Serwis | URL | Dane logowania |
|---|---|---|
| Client PWA | `http://localhost:3000` | Login: `+48 111 111 111` (test OTP: `123456`) |
| Provider panel | `http://localhost:3001` | Login: `+48 222 222 222` (test OTP: `123456`) |
| Landing | `http://localhost:3002` | — (publiczny) |
| API Swagger | `http://localhost:4000/v1/docs` | — (publiczny w dev) |
| Mailpit | `http://localhost:8025` | — (preview wszystkich emaili) |
| PostgreSQL | `localhost:5432` | DB: `opony` / User: `opony` / Pass: `opony` |

### 4.4. Komendy Turborepo

```bash
pnpm dev                    # uruchom wszystkie apps w trybie dev
pnpm build                  # zbuduj wszystkie apps + packages
pnpm lint                   # ESLint na calym monorepo
pnpm test                   # Vitest — unit + integration
pnpm test:e2e               # Playwright — E2E
pnpm db:migrate             # Prisma migrate dev
pnpm db:seed                # Seed danych testowych
pnpm db:studio              # Prisma Studio (GUI do DB)
pnpm storybook              # Storybook design-system
pnpm generate:api-client    # Regeneruj typed fetch z OpenAPI
```

### 4.5. Zmienne środowiskowe (.env.example)

| Zmienna | Opis | Wymagana | Przyklad |
|---|---|---|---|
| `DATABASE_URL` | Connection string do PostgreSQL | Tak | `postgresql://opony:opony@localhost:5432/opony` |
| `JWT_SECRET` | Secret do podpisywania access tokenow | Tak | `super-secret-jwt-key-min-32-chars` |
| `JWT_REFRESH_SECRET` | Secret do refresh tokenow | Tak | `super-secret-refresh-key-min-32-chars` |
| `TWILIO_SID` | Twilio Account SID | Tak (prod) | `AC...` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | Tak (prod) | `...` |
| `TWILIO_PHONE` | Twilio phone number lub Sender ID | Tak (prod) | `OPONY` lub `+48...` |
| `P24_MERCHANT_ID` | Przelewy24 Merchant ID | Tak (prod) | `123456` |
| `P24_API_KEY` | Przelewy24 API Key | Tak (prod) | `...` |
| `P24_CRC` | Przelewy24 CRC Key (weryfikacja webhook) | Tak (prod) | `...` |
| `P24_CALLBACK_URL` | URL callbacku P24 po płatności | Tak (prod) | `https://api.opony.app/v1/webhooks/p24` |
| `RESEND_API_KEY` | Resend API Key | Tak (prod) | `re_...` |
| `AWS_S3_BUCKET` | Nazwa bucketu S3 | Tak (prod) | `opony-uploads-prod` |
| `AWS_ACCESS_KEY_ID` | AWS Access Key | Tak (prod) | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | AWS Secret Key | Tak (prod) | `...` |
| `AWS_REGION` | AWS Region | Tak | `eu-central-1` |
| `SENTRY_DSN` | Sentry DSN (per projekt) | Tak (prod) | `https://...@sentry.io/...` |
| `GOOGLE_MAPS_API_KEY` | Google Maps API Key (server-side) | Tak (prod) | `AIza...` |
| `GUS_API_KEY` | Klucz API GUS BIR | Tak (prod) | `...` |
| `NEXT_PUBLIC_API_URL` | URL backendu dla frontendow | Tak | `http://localhost:4000/v1` |
| `NEXT_PUBLIC_API_MOCK` | Wlacz MSW mocking (true/false) | Nie | `true` |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps API Key (client-side) | Tak (prod) | `AIza...` |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog API Key | Nie | `phc_...` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (frontend) | Nie | `https://...@sentry.io/...` |

**Uwaga:** W trybie dev (`NEXT_PUBLIC_API_MOCK=true`) MSW przechwytuje requesty API — nie potrzebujesz prawdziwych kluczy Twilio/P24/S3.

---

## 5. Backend: architektura NestJS

### 5.1. Mapa modułów

```
AppModule
├── AuthModule (OtpStrategy, JwtStrategy, guards)
│   └── SmsModule (TwilioSmsService)
├── UserModule
├── VehicleModule
├── ProviderModule (onboarding, GUS)
│   └── EmailModule (ResendService)
├── CatalogModule (listing, search)
│   └── AvailabilityModule (slot generation)
├── BookingModule (CRUD, state machine)
│   ├── PaymentModule (P24 service, webhooks)
│   └── SmsModule
├── ReviewModule
├── UploadModule (S3 presigned URLs)
├── AdminModule
├── CronModule
│   ├── NoShowCron
│   ├── PaymentTimeoutCron
│   ├── WeeklyPayoutsCron
│   ├── RatingCacheCron
│   └── AdminAlertCron
└── CommonModule (filters, interceptors, pipes)
```

### 5.2. Wzorce i konwencje

| Wzorzec | Implementacja | Przyklad |
|---|---|---|
| **Dependency Injection** | NestJS IoC, interfejsy z `@Inject` token | `SmsService` → `TwilioSmsService` (swappable na `SmsApiPlService`) |
| **Guards** | Custom decorators + CanActivate | `@RequireRole(CLIENT)`, `@RequireProviderOwner()`, `@Public()` |
| **Interceptors** | NestJS interceptors | `AuditLogInterceptor` — każda zmiana Booking/Provider → `AuditLog` |
| **Exception Filters** | `GlobalHttpExceptionFilter` | RFC 7807 Problem Details (`type`, `title`, `status`, `detail`, `instance`) |
| **Validation (DTO)** | `class-validator` + `class-transformer` | `@IsNotEmpty()`, `@IsPhoneNumber('PL')`, `@IsUUID()` na każdym DTO |
| **Business validation** | Zod schemas | Complex rules (np. walidacja slotu, adresu w strefie) |
| **Cron jobs** | NestJS `@Cron` decorator + `ScheduleModule` | `@Cron('*/5 * * * *') markNoShows()` |
| **Prisma usage** | PrismaService extends PrismaClient, `onModuleInit` | `$transaction` dla operacji atomowych, `$queryRaw` dla haversine |
| **Naming** | `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts`, `*.guard.ts` | Standardowa konwencja NestJS |
| **Error codes** | Enum `ErrorCode` w `shared-types` | `SLOT_ALREADY_BOOKED`, `ADDRESS_OUTSIDE_ZONE`, `PROVIDER_NOT_APPROVED` |

### 5.3. Kluczowe problemy techniczne i rozwiązania

#### 1. Double-booking (race condition)

**Problem:** Dwoch klientow rezerwuje ten sam slot jednocześnie.

**Rozwiązanie (3 warstwy):**
1. **DB constraint:** Partial unique index `(providerId, startAt) WHERE status IN ('PENDING','CONFIRMED','IN_PROGRESS')`.
2. **Application lock:** Prisma `$transaction` z `SELECT ... FOR UPDATE` na slotach providera.
3. **Idempotency:** Naglowek `Idempotency-Key` — retry nie tworzy duplikatu.

```sql
-- Partial unique index zapobiegajacy double-booking
CREATE UNIQUE INDEX idx_booking_no_double
  ON "Booking" ("providerId", "startAt")
  WHERE status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS');
```

#### 2. Strefa obsługi (bez PostGIS)

**Problem:** Sprawdzenie czy adres klienta jest w zasięgu mobilnego providera.

**Rozwiązanie:** Haversine formula w raw SQL:

```sql
SELECT *,
  ( 6371 * acos(
      cos(radians(:clientLat)) * cos(radians(p."cityCenterLat"))
      * cos(radians(p."cityCenterLng") - radians(:clientLng))
      + sin(radians(:clientLat)) * sin(radians(p."cityCenterLat"))
  )) AS distance_km
FROM "Provider" p
WHERE status = 'APPROVED'
HAVING distance_km <= p."serviceRadiusKm"
ORDER BY distance_km ASC;
```

**Ewolucja v1:** PostGIS z polygon stref (`ST_Contains`).

#### 3. Generowanie slotów dostępnośći

**Algorytm:**
1. Pobierz `WorkingHours` dla danego dnia tygodnia.
2. Generuj sloty co `slotMinutes` (np. 45 min) od `openTime` do `closeTime`.
3. Odejmij `ScheduleException` (urlopy, swieta — nadpisuja WorkingHours).
4. Odejmij aktywne `Booking` (status IN PENDING, CONFIRMED, IN_PROGRESS).
5. Zwroc liste `{ startAt, endAt, available: true/false }`.

**Cache:** Brak cache w v0 (query jest szybki dla 1 providera). V1: Redis cache z invalidacja przy zmianach.

#### 4. Payment timeout

**Problem:** Klient inicjuje płatność ale nie konczy (opuszcza strone P24).

**Rozwiązanie:** Cron co 1 min:
- `Payment.status == INITIATED AND createdAt < NOW() - INTERVAL '15 min'`
- → `Payment.status = FAILED`
- → `Booking.status = CANCELLED_BY_CLIENT`
- → Slot zwolniony (usuwany constraint)

#### 5. Unified auth (jeden system dla obu typow uzytkownikow)

**Problem:** Klienci i providerzy potrzebuja logowania — jak najprościej?

**Rozwiązanie:**
- `OtpStrategy` — jeden flow SMS OTP dla wszystkich uzytkownikow (klientow i providerow).
- Wspólny `JwtModule` — generuje JWT z polem `role` (CLIENT vs PROVIDER_OWNER).
- Guard sprawdza `role` z JWT, nie sposob logowania.
- Brak haseł w systemie — zero password storage, zero password reset flow.

---

## 6. Auth architecture

### 6.1. Diagram: Klient (OTP flow)

```
┌─────────┐                    ┌─────────┐                    ┌───────┐
│ Client  │                    │   API   │                    │Twilio │
│  PWA    │                    │ NestJS  │                    │ (SMS) │
└────┬────┘                    └────┬────┘                    └───┬───┘
     │                              │                             │
     │ POST /v1/auth/otp/request    │                             │
     │ {phone: "+48111111111"}      │                             │
     │─────────────────────────────>│                             │
     │                              │ send SMS (6-cyfrowy kod)    │
     │                              │────────────────────────────>│
     │                              │                             │
     │         204 No Content       │                             │
     │<─────────────────────────────│                             │
     │                              │                             │
     │ POST /v1/auth/otp/verify     │                             │
     │ {phone, code: "123456"}      │                             │
     │─────────────────────────────>│                             │
     │                              │ verify bcrypt(code)         │
     │                              │ create/find User            │
     │                              │ generate JWT pair           │
     │                              │                             │
     │  {accessToken, refreshToken, │                             │
     │   user, requiresConsent}     │                             │
     │<─────────────────────────────│                             │
     │                              │                             │
     │ [jesli requiresConsent=true] │                             │
     │ POST /v1/me/consent          │                             │
     │ {terms: true, privacy: true} │                             │
     │─────────────────────────────>│                             │
     │         201 Created          │                             │
     │<─────────────────────────────│                             │
     │                              │                             │
     │ Authorization: Bearer <at>   │                             │
     │ (każdy request)              │                             │
     │─────────────────────────────>│                             │
     │                              │                             │
     │ POST /v1/auth/refresh        │                             │
     │ {refreshToken} (httpOnly)    │                             │
     │─────────────────────────────>│                             │
     │  {accessToken, refreshToken} │                             │
     │<─────────────────────────────│                             │
     │                              │                             │
     │ POST /v1/auth/logout         │                             │
     │─────────────────────────────>│ invalidate refresh token    │
     │         204 No Content       │                             │
     │<─────────────────────────────│                             │
```

**Reguly OTP:**
- Kod ważny 5 min.
- Max 3 proby weryfikacji per kod.
- Max 3 kody / 15 min / numer telefonu (rate limit).
- Kod hashowany bcrypt w tabeli `OtpToken`.

### 6.2. Diagram: Provider (SMS OTP flow — ten sam co klient)

Providerzy logują się tak samo jak klienci — SMS OTP na telefon podany przy rejestracji. Po weryfikacji OTP, system sprawdza czy User ma powiązany Provider — jeśli tak, JWT zawiera `providerId` i `role=PROVIDER_OWNER`.

```
┌──────────┐                   ┌─────────┐                   ┌───────┐
│ Provider │                   │   API   │                   │Twilio │
│   Web    │                   │ NestJS  │                   │ (SMS) │
└────┬─────┘                   └────┬────┘                   └───┬───┘
     │                              │                            │
     │ POST /v1/provider/signup     │                            │
     │ {nip, email, companyName,    │                            │
     │  phone}                      │                            │
     │─────────────────────────────>│                            │
     │                              │ create User (PROVIDER_OWNER)
     │                              │ create Provider (PENDING_NIP)
     │         201 Created          │                            │
     │<─────────────────────────────│                            │
     │                              │                            │
     │ POST /v1/auth/otp/request    │                            │
     │ {phone}                      │                            │
     │─────────────────────────────>│ send SMS code              │
     │                              │───────────────────────────>│
     │         204 No Content       │                            │
     │<─────────────────────────────│                            │
     │                              │                            │
     │ POST /v1/auth/otp/verify     │                            │
     │ {phone, code}                │                            │
     │─────────────────────────────>│                            │
     │                              │ verify OTP code            │
     │                              │ check User.role            │
     │                              │ if PROVIDER_OWNER →        │
     │                              │   add providerId to JWT    │
     │                              │ check Provider.status      │
     │                              │                            │
     │  {accessToken, refreshToken, │                            │
     │   user, provider}            │                            │
     │<─────────────────────────────│                            │
     │                              │                            │
     │  [jesli Provider.status      │                            │
     │   != APPROVED → FE pokazuje  │                            │
     │   ekran statusu]             │                            │
```

**Reguly provider auth (identyczne z klientem):**
- Kod OTP ważny 5 min. Max 3 proby weryfikacji per kod.
- Max 3 kody / 15 min / numer telefonu (rate limit).
- Login możliwy dla kazdego statusu providera, ale:
  - `PENDING_NIP`, `PENDING_DOCS`, `PENDING_APPROVAL` → przekierowanie na odpowiedni krok onboardingu.
  - `APPROVED` → pełny dostep do panelu.
  - `SUSPENDED` → widok „konto zawieszone" + kontakt z supportem.
  - `REJECTED` → widok „konto odrzucone" z powodem.

### 6.3. JWT payload structure

```json
{
  "sub": "550e8400-e29b-41d4-a716-446655440000",
  "role": "CLIENT | PROVIDER_OWNER | ADMIN",
  "providerId": "660e8400-e29b-41d4-a716-446655440001 | null",
  "iat": 1714000000,
  "exp": 1714000900
}
```

| Pole | Typ | Opis |
|---|---|---|
| `sub` | UUID | ID uzytkownika (User.id) |
| `role` | enum | `CLIENT`, `PROVIDER_OWNER`, `ADMIN` — rola z `User.role` w DB |
| `providerId` | UUID / null | ID firmy providera (tylko dla PROVIDER_OWNER) |
| `iat` | timestamp | Issued at |
| `exp` | timestamp | Expiration — access: +15 min, refresh: +30 dni |

### 6.4. Guard logic

| Decorator | Logika | Użycie |
|---|---|---|
| `@Public()` | Skip auth — endpoint publiczny | `GET /v1/providers`, `POST /v1/auth/otp/*` |
| `@RequireRole(CLIENT)` | Sprawdz `role == CLIENT` z JWT | `POST /v1/bookings`, `GET /v1/me` |
| `@RequireRole(PROVIDER_OWNER)` | Sprawdz `role == PROVIDER_OWNER` | `GET /v1/provider/me` |
| `@RequireProviderOwner()` | `role == PROVIDER_OWNER` + `providerId != null` + `Provider.status == APPROVED` | `POST /v1/provider/me/bookings/:id/accept` |
| `@RequireRole(ADMIN)` | Sprawdz `role == ADMIN` | `POST /v1/admin/providers/:id/approve` |

**Kolejnosc middleware:**
1. `JwtAuthGuard` — dekoduje token, ustawia `request.user`.
2. `RolesGuard` — sprawdza `@RequireRole()` metadata.
3. `ProviderOwnerGuard` — sprawdza `@RequireProviderOwner()` metadata.
4. Controller handler — logika biznesowa.

---

## 7. Design System

### 7.1. Design tokens (`/packages/design-tokens`)

```json
{
  "colors": {
    "primary": "#2563EB",
    "primaryHover": "#1D4ED8",
    "primaryLight": "#DBEAFE",
    "success": "#16A34A",
    "successLight": "#DCFCE7",
    "warning": "#F59E0B",
    "warningLight": "#FEF3C7",
    "error": "#DC2626",
    "errorLight": "#FEE2E2",
    "neutral50": "#F8FAFC",
    "neutral100": "#F1F5F9",
    "neutral200": "#E2E8F0",
    "neutral300": "#CBD5E1",
    "neutral400": "#94A3B8",
    "neutral500": "#64748B",
    "neutral600": "#475569",
    "neutral700": "#334155",
    "neutral800": "#1E293B",
    "neutral900": "#0F172A",
    "white": "#FFFFFF",
    "black": "#000000"
  },
  "spacing": {
    "xs": "4px",
    "sm": "8px",
    "md": "16px",
    "lg": "24px",
    "xl": "32px",
    "2xl": "48px",
    "3xl": "64px"
  },
  "radii": {
    "sm": "4px",
    "md": "8px",
    "lg": "16px",
    "full": "9999px"
  },
  "typography": {
    "heading1": { "fontSize": "24px", "fontWeight": 700, "lineHeight": 1.2 },
    "heading2": { "fontSize": "20px", "fontWeight": 600, "lineHeight": 1.3 },
    "heading3": { "fontSize": "18px", "fontWeight": 600, "lineHeight": 1.3 },
    "body": { "fontSize": "16px", "fontWeight": 400, "lineHeight": 1.5 },
    "bodySmall": { "fontSize": "14px", "fontWeight": 400, "lineHeight": 1.5 },
    "caption": { "fontSize": "12px", "fontWeight": 400, "lineHeight": 1.4 },
    "button": { "fontSize": "16px", "fontWeight": 600, "lineHeight": 1.2 }
  },
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.05)",
    "md": "0 4px 6px rgba(0,0,0,0.07)",
    "lg": "0 10px 15px rgba(0,0,0,0.1)"
  }
}
```

### 7.2. Base components (10, z Sprint DS-0)

| Komponent | Props | Użycie | Warianty |
|---|---|---|---|
| **Button** | `variant`, `size`, `disabled`, `loading`, `icon`, `fullWidth` | CTA, formularze, akcje | `primary`, `secondary`, `ghost`, `danger` |
| **Input** | `label`, `error`, `hint`, `type`, `disabled`, `icon` | Formularze logowania, wyszukiwania, profilu | `text`, `password`, `tel`, `search` |
| **Badge** | `variant`, `size`, `dot` | Status rezerwacji, status providera | kolory per status (patrz 7.3) |
| **Card** | `padding`, `shadow`, `onClick`, `href` | Lista providerów, rezerwacje, cennik | `default`, `interactive`, `outlined` |
| **Modal** | `isOpen`, `onClose`, `title`, `size` | Potwierdzenie anulowania, szczegóły | `sm`, `md`, `lg` |
| **BottomTabBar** | `items`, `activeIndex` | Nawigacja klienta PWA (mobile) | — |
| **SideMenu** | `items`, `activeItem`, `collapsed` | Nawigacja provider panel (desktop) | `expanded`, `collapsed` |
| **Spinner** | `size`, `color` | Ladowanie danych, submit | `sm`, `md`, `lg` |
| **Toast** | `message`, `variant`, `duration`, `onClose` | Potwierdzenia, bledy, info | `success`, `error`, `warning`, `info` |
| **EmptyState** | `icon`, `title`, `description`, `action` | Brak rezerwacji, brak wynikow | — |

### 7.3. Status Badge kolory

| Status | Kolor | Token | Kontekst |
|---|---|---|---|
| `PENDING` | Zolty | `warning` | Rezerwacja oczekuje na akceptacje |
| `CONFIRMED` | Zielony | `success` | Provider zaakceptowal |
| `IN_PROGRESS` | Niebieski | `primary` | Usluga w trakcie |
| `COMPLETED` | Szary | `neutral500` | Zakonczono |
| `CANCELLED_BY_CLIENT` | Czerwony | `error` | Klient anulowal |
| `CANCELLED_BY_PROVIDER` | Czerwony | `error` | Provider anulowal |
| `NO_SHOW` | Szary | `neutral400` | Klient nie pojawil sie |
| `REJECTED` | Czerwony | `error` | Provider odrzucil |

---

## 8. Model danych

### 8.1. Schemat encji (Postgres — MVP v0 bez PostGIS)

```sql
-- UZYTKOWNIK (klient, usługodawca, admin)
User {
  id          UUID PK
  email       VARCHAR(254) UNIQUE NULL
  phone       VARCHAR(20)  UNIQUE NOT NULL   -- glowny identyfikator
  role        ENUM(CLIENT, PROVIDER_OWNER, PROVIDER_STAFF, ADMIN)
  firstName   VARCHAR(100)
  lastName    VARCHAR(100)
  noShowCount INT DEFAULT 0                   -- antyspam rezerwacji
  isBanned    BOOLEAN DEFAULT false
  createdAt   TIMESTAMPTZ
  updatedAt   TIMESTAMPTZ
  deletedAt   TIMESTAMPTZ                     -- soft delete
}

-- POJAZD KLIENTA
Vehicle {
  id          UUID PK
  userId      UUID FK → User
  nickname    VARCHAR(100)           -- "Ford Focus zony"
  tireSize    VARCHAR(20) NOT NULL   -- "205/55 R16"
  createdAt   TIMESTAMPTZ
}

-- FIRMA USLUGODAWCY
Provider {
  id              UUID PK
  name            VARCHAR(200) NOT NULL
  slug            VARCHAR(100) UNIQUE
  nip             VARCHAR(10) UNIQUE NOT NULL
  type            ENUM(MOBILE, STATIONARY)   -- v0: tylko MOBILE
  status          ENUM(PENDING_NIP, PENDING_DOCS, PENDING_APPROVAL,
                       APPROVED, SUSPENDED, REJECTED)
  description     TEXT
  logoUrl         VARCHAR(500)
  phone           VARCHAR(20)
  email           VARCHAR(254)
  ownerId         UUID FK → User          -- role=PROVIDER_OWNER
  cityCenterLat   DECIMAL(9,6)
  cityCenterLng   DECIMAL(9,6)
  serviceRadiusKm INT DEFAULT 10
  avgRating       DECIMAL(3,2)            -- denormalized cache
  reviewCount     INT DEFAULT 0           -- denormalized cache
  bankAccountIban VARCHAR(34) NULL        -- do wyplat P24 (US-51)
  createdAt       TIMESTAMPTZ
  approvedAt      TIMESTAMPTZ
}

ProviderPhoto {
  id         UUID PK
  providerId UUID FK → Provider
  url        VARCHAR(500)
  order      INT
}

-- CENNIK — 3 widelki rozmiaru felgi
PricingTier {
  id                         UUID PK
  providerId                 UUID FK → Provider
  rimSizeMin                 INT           -- np. 16
  rimSizeMax                 INT           -- np. 17
  priceSwapPln               DECIMAL(10,2) -- wymiana 4 opon
  priceBalancingPerWheelPln  DECIMAL(10,2) NULL
  travelFeeFirstKmPln        DECIMAL(10,2) DEFAULT 0  -- 0–10 km
  travelFeeExtraKmPln        DECIMAL(10,2) DEFAULT 0  -- 10–15 km
  UNIQUE (providerId, rimSizeMin, rimSizeMax)
}

-- GODZINY PRACY
WorkingHours {
  id          UUID PK
  providerId  UUID FK → Provider
  dayOfWeek   INT (0–6, 0=niedziela)
  openTime    TIME
  closeTime   TIME
  slotMinutes INT               -- np. 45
  isClosed    BOOLEAN DEFAULT false
  UNIQUE (providerId, dayOfWeek)
}

-- WYJATKI W HARMONOGRAMIE (urlopy, swieta)
ScheduleException {
  id              UUID PK
  providerId      UUID FK → Provider
  date            DATE
  reason          VARCHAR(200)
  customOpenTime  TIME NULL          -- NULL = caly dzien zamkniety
  customCloseTime TIME NULL
  UNIQUE (providerId, date)
}

-- REZERWACJA — serce systemu
Booking {
  id             UUID PK
  referenceCode  VARCHAR(10) UNIQUE     -- "OPN-4F2K"
  clientId       UUID FK → User
  providerId     UUID FK → Provider
  vehicleId      UUID FK → Vehicle
  pricingTierId  UUID FK → PricingTier  -- snapshot ref
  status         ENUM(PENDING, CONFIRMED, IN_PROGRESS, COMPLETED,
                      CANCELLED_BY_CLIENT, CANCELLED_BY_PROVIDER,
                      NO_SHOW, REJECTED)
  startAt        TIMESTAMPTZ NOT NULL
  endAt          TIMESTAMPTZ NOT NULL
  -- adres klienta (mobile)
  addressLine    VARCHAR(300)
  addressCity    VARCHAR(100)
  addressLat     DECIMAL(9,6)
  addressLng     DECIMAL(9,6)
  -- wycena — snapshot cen z momentu rezerwacji
  tireSize       VARCHAR(20)
  basePricePln   DECIMAL(10,2)
  travelFeePln   DECIMAL(10,2)
  totalPricePln  DECIMAL(10,2)
  paymentMethod  ENUM(ONLINE_BLIK, ONLINE_CARD, ONLINE_TRANSFER)  -- v0: Przelewy24
  notes          TEXT                               -- klient → provider
  rejectReason   VARCHAR(500) NULL
  cancelReason   VARCHAR(500) NULL
  createdAt      TIMESTAMPTZ
  confirmedAt    TIMESTAMPTZ NULL
  startedAt      TIMESTAMPTZ NULL
  completedAt    TIMESTAMPTZ NULL
  cancelledAt    TIMESTAMPTZ NULL

  INDEX (providerId, startAt)
  INDEX (clientId, startAt DESC)
  UNIQUE (providerId, startAt)
    WHERE status IN (PENDING, CONFIRMED, IN_PROGRESS)
  -- ^ kluczowy constraint: zapobiega double-booking na poziomie DB
}

-- OCENA PO REZERWACJI
Review {
  id                UUID PK
  bookingId         UUID FK → Booking UNIQUE
  clientId          UUID FK → User
  providerId        UUID FK → Provider
  rating            INT CHECK (rating BETWEEN 1 AND 5)
  comment           TEXT
  providerReply     TEXT NULL
  providerRepliedAt TIMESTAMPTZ NULL
  isReported        BOOLEAN DEFAULT false
  isHidden          BOOLEAN DEFAULT false
  seenByProvider    BOOLEAN DEFAULT false    -- badge "nowe opinie" w B2B
  editCount         INT DEFAULT 0            -- ile razy klient edytowal
  lastEditedAt      TIMESTAMPTZ NULL
  createdAt         TIMESTAMPTZ
}

-- TOKEN SMS OTP
OtpToken {
  id        UUID PK
  phone     VARCHAR(20)
  codeHash  VARCHAR(200)           -- bcrypt
  expiresAt TIMESTAMPTZ
  usedAt    TIMESTAMPTZ NULL
  attempts  INT DEFAULT 0
  INDEX (phone, expiresAt)
}

-- PLATNOSC (Przelewy24)
Payment {
  id             UUID PK
  bookingId      UUID FK → Booking UNIQUE
  externalId     VARCHAR(100)           -- ID transakcji P24
  method         ENUM(BLIK, CARD, TRANSFER)
  status         ENUM(INITIATED, COMPLETED, FAILED, REFUNDED, PARTIALLY_REFUNDED)
  amountPln      DECIMAL(10,2)          -- kwota klienta (= Booking.totalPricePln)
  feePln         DECIMAL(10,2)          -- oplata P24 (~1,5% + 0,50)
  commissionPln  DECIMAL(10,2)          -- prowizja platformy (8%)
  providerPayoutPln DECIMAL(10,2)       -- kwota do wyplaty providerówi
  payoutStatus   ENUM(PENDING, PAID, FAILED) DEFAULT PENDING
  paidOutAt      TIMESTAMPTZ NULL
  refundedAt     TIMESTAMPTZ NULL
  createdAt      TIMESTAMPTZ
  completedAt    TIMESTAMPTZ NULL
  INDEX (bookingId)
  INDEX (payoutStatus, paidOutAt)
}

-- ZGODY REGULAMINOWE (RODO / regulamin)
ConsentLog {
  id             UUID PK
  userId         UUID FK → User NULL       -- NULL jesli provider pre-registration
  providerId     UUID FK → Provider NULL
  consentType    ENUM(TERMS, PRIVACY, MARKETING)
  version        VARCHAR(20)               -- np. "2026-04-v1"
  accepted       BOOLEAN
  ipAddress      VARCHAR(45)
  createdAt      TIMESTAMPTZ
  INDEX (userId, consentType)
}

-- WAITLISTA (miasta poza zasięgiem v0)
WaitlistSignup {
  id        UUID PK
  email     VARCHAR(254)
  city      VARCHAR(100)
  role      ENUM(CLIENT, PROVIDER)
  createdAt TIMESTAMPTZ
}

-- LOG AUDYTU (soft)
AuditLog {
  id         UUID PK
  actorId    UUID FK → User NULL
  entity     VARCHAR(50)           -- 'Booking', 'Provider'
  entityId   UUID
  action     VARCHAR(50)           -- 'status_changed', 'created'
  payload    JSONB                 -- before/after
  createdAt  TIMESTAMPTZ
}
```

### 8.2. Diagram relacji (ER)

```
  ┌──────┐1     N ┌─────────┐
  │ User │───────<│ Vehicle │
  │      │        └─────────┘
  │      │1
  └──┬───┘                           1┌──────────┐
     │                         ┌──────│ Provider │
     │                         │      └────┬─────┘
     │N                        │N          │1
     │         ┌─────────┐     │           │N
     └────────<│ Booking │>────┘     ┌─────┴──────────┐
               │         │1          │                │
               └──┬───┬──┘      ┌────▼─────┐    ┌─────▼──────┐
                  │1  │1        │ Pricing  │    │ Working    │
             ┌────▼┐ ┌▼─────┐   │  Tier    │    │  Hours     │
             │Review │Payment│   └──────────┘    └────────────┘
             └──────┘└───────┘
               └─────────┘           1N               1N
                                ┌────────┐    ┌──────────────┐
                                │Provider│    │  Schedule    │
                                │ Photo  │    │  Exception   │
                                └────────┘    └──────────────┘
```

### 8.3. Maszyna stanow rezerwacji (Booking)

```
                               ┌─────┐
           client creates      │  ∅  │
           ──────────────────► └──┬──┘
                                  ▼
                            ┌─────────┐
                            │ PENDING │
                            └────┬────┘
             provider accept     │
          ┌─────────────────────┤
          │         provider    │    client cancel (> 2h)
          │         reject      │ ┌──────────────────────┐
          │   ┌────────────────┐│ │                      │
          ▼   ▼                ││ ▼                      ▼
     ┌─────────┐         ┌─────▼────────┐    ┌──────────────────────┐
     │REJECTED │         │   CONFIRMED  │    │ CANCELLED_BY_CLIENT  │
     │(terminal)         │              │    │ (terminal)           │
     └─────────┘         └──┬──────┬─┬──┘    └──────────────────────┘
                            │      │ │
         provider start     │      │ └─► provider cancel ────┐
            ────────────────┘      │                         │
                                   │ cron: startAt+30min     ▼
                            ┌──────▼──────┐         ┌────────────────────┐
                            │ IN_PROGRESS │         │CANCELLED_BY_PROVIDER│
                            └──────┬──────┘         │    (terminal)       │
                                   │                └────────────────────┘
                    provider       │    cron: startAt+30min, no start
                    complete       │    ┌──────────────►┌─────────┐
                                   ▼    │               │NO_SHOW  │
                            ┌───────────┐               │(terminal)
                            │ COMPLETED │               └─────────┘
                            │(terminal) │
                            └───────────┘
```

**Reguly przejsc:**

| Z | Do | Kto | Warunki |
|---|---|---|---|
| — | PENDING | klient (create) | slot wolny, adres w strefie, klient nie zbanowany |
| PENDING | CONFIRMED | provider (accept) | — |
| PENDING | REJECTED | provider (reject) | powod wymagany |
| PENDING | CANCELLED_BY_CLIENT | klient | > 2h przed startAt |
| CONFIRMED | CANCELLED_BY_CLIENT | klient | > 2h przed startAt; ponizej → `noShowCount++` |
| CONFIRMED | CANCELLED_BY_PROVIDER | provider | powod wymagany |
| CONFIRMED | IN_PROGRESS | provider (start) | — |
| IN_PROGRESS | COMPLETED | provider (complete) | — |
| CONFIRMED | NO_SHOW | system (cron, co 5 min) | `startAt < NOW() - 30min` i brak `IN_PROGRESS` |

**Niezmienniki:**
- Stan terminalny (COMPLETED, CANCELLED_*, NO_SHOW, REJECTED) → `status` i kluczowe pola sa immutable.
- Oceny (Review) dozwolone **wylacznie** dla `COMPLETED`.
- `pricingTierId` + `basePricePln` zamrozone w momencie `create` — zmiana cennika przez providera nie wplywa na istniejace rezerwacje.

### 8.4. Maszyna stanow usługodawcy (onboarding)

```
     [signup]
         │
         ▼
  ┌──────────────────┐
  │  PENDING_NIP     │─── NIP nieważny ───────► REJECTED (terminal)
  └────────┬─────────┘
           │ GUS API: ważny
           ▼
  ┌──────────────────┐
  │  PENDING_DOCS    │─── provider wgrywa zdjecia/certyfikaty
  └────────┬─────────┘
           │
           ▼
  ┌──────────────────┐
  │PENDING_APPROVAL  │─── admin weryfikuje
  └────────┬─────────┘
           │ approve
           ▼
  ┌──────────────────┐      suspend      ┌──────────────┐
  │    APPROVED      │◄─────────────────►│  SUSPENDED   │
  │ (widoczny w app) │     reinstate     │              │
  └──────────────────┘                   └──────────────┘
```

Automat suspendujacy: jesli provider ma w ostatnich 30 dniach > 3 `REJECTED/CANCELLED_BY_PROVIDER` na istniejace rezerwacje LUB avgRating < 3.0 przy > 10 ocenach.

### 8.5. Krytyczne constrainty integralnosci

1. **Brak double-booking** → unikalny indeks czesciowy `(providerId, startAt)` dla aktywnych statusow.
2. **Walidacja adresu w strefie** → przy `POST /v1/bookings` server liczy `haversine(provider.cityCenter, booking.address) <= serviceRadiusKm`.
3. **Ocena tylko po COMPLETED** → DB check + API guard.
4. **Snapshot cennika** → pola `basePricePln`, `travelFeePln`, `totalPricePln` kopiowane w momencie tworzenia.
5. **Audyt** → trigger DB zapisuje każda zmiane `Booking.status` do `AuditLog`.

---

## 9. Kontrakt REST API (MVP v0)

### 9.1. Konwencje

- Base URL: `https://api.opony.app/v1`
- Format: `application/json; charset=utf-8`
- Auth: `Authorization: Bearer <accessToken>` (JWT, 15 min TTL)
- Refresh: `refreshToken` (30 dni TTL) w httpOnly cookie lub body
- Paginacja: `?page=1&pageSize=20` → `{ data: [...], meta: { total, page, pageSize } }`
- Daty: ISO 8601 UTC (`2026-04-14T08:00:00Z`)
- ID: UUID v4
- Bledy (RFC 7807):
  ```json
  {
    "type": "https://api.opony.app/errors/slot-already-booked",
    "title": "SlotAlreadyBooked",
    "status": 409,
    "detail": "Ten termin zostal w międzyczasie zajety",
    "instance": "/v1/bookings"
  }
  ```
- Idempotencja: `POST /v1/bookings` akceptuje naglowek `Idempotency-Key`.

### 9.2. Auth (klient — SMS OTP)

| Method | Path | Opis |
|---|---|---|
| POST | `/v1/auth/otp/request` | Body: `{phone}` → 204. Rate limit: 3/15 min/phone. |
| POST | `/v1/auth/otp/verify` | Body: `{phone, code}` → `{accessToken, refreshToken, user, requiresConsent}` lub 401. |
| POST | `/v1/auth/refresh` | Body: `{refreshToken}` → `{accessToken, refreshToken}`. |
| POST | `/v1/auth/logout` | → 204. Unieważnia refresh. |

### 9.2b. Auth (provider — SMS OTP)

Providerzy używają tych samych endpointów auth co klienci (sekcja 9.2). Po zalogowaniu SMS OTP, JWT zawiera `role=PROVIDER_OWNER` i `providerId`.

Brak oddzielnych endpointów `/v1/provider/auth/*` — cały flow przez `/v1/auth/otp/*`.

### 9.3. Profil klienta

| Method | Path | Opis |
|---|---|---|
| GET | `/v1/me` | Zwraca `{id, phone, email, firstName, lastName, role}` |
| PATCH | `/v1/me` | Body: `{firstName?, lastName?, email?}` |
| POST | `/v1/me/consent` | Body: `{terms: true, privacy: true, marketing?: false}` → 201. Wymagane po pierwszym logowaniu. |
| GET | `/v1/me/vehicles` | Lista pojazdów |
| POST | `/v1/me/vehicles` | Body: `{nickname, tireSize}` → 201 |
| PATCH | `/v1/me/vehicles/:id` | — |
| DELETE | `/v1/me/vehicles/:id` | → 204 |

### 9.4. Katalog usługodawcow (publiczny — bez auth)

| Method | Path | Opis |
|---|---|---|
| GET | `/v1/providers` | Query: `city, lat, lng, tireSize, date, sort=distance\|price\|rating, page`. Zwraca liste z obliczonym dystansem i najblizszym slotem. |
| GET | `/v1/providers/:slug` | Szczegóły + cennik + godziny + top 3 opinie |
| GET | `/v1/providers/:slug/reviews` | Paginowane opinie. Query: `?page=&sort=newest\|rating_desc` |
| GET | `/v1/providers/:slug/availability` | Dostępność slotów. Query: `?from=2026-04-14&to=2026-04-20&tireSize=205/55R16&clientLat=&clientLng=` |

Response `GET /v1/providers/:slug/availability`:
```json
{
  "providerId": "7d...",
  "tireSize": "205/55R16",
  "pricing": {
    "rimSize": 16,
    "basePricePln": 180,
    "travelFeePln": 0,
    "totalPricePln": 180
  },
  "addressInZone": true,
  "days": [
    {
      "date": "2026-04-14",
      "slots": [
        { "startAt": "2026-04-14T08:00:00Z", "endAt": "2026-04-14T08:45:00Z", "available": true },
        { "startAt": "2026-04-14T08:45:00Z", "endAt": "2026-04-14T09:30:00Z", "available": false }
      ]
    }
  ]
}
```

### 9.5. Rezerwacje (klient)

| Method | Path | Opis |
|---|---|---|
| POST | `/v1/bookings` | Utwórz + inicjuj płatność. Naglowek: `Idempotency-Key`. Zwraca `{booking, paymentUrl}`. |
| GET | `/v1/me/bookings` | Query: `?status=upcoming\|past\|all&page=` |
| GET | `/v1/bookings/:id` | Szczegóły (sprawdzenie ownership) |
| POST | `/v1/bookings/:id/cancel` | Body: `{reason}` — klient anuluje |
| POST | `/v1/bookings/:id/review` | Body: `{rating:1–5, comment}` — tylko COMPLETED |

Request `POST /v1/bookings`:
```json
{
  "providerId": "7d...",
  "vehicleId": "aa...",
  "startAt": "2026-04-14T08:00:00Z",
  "address": {
    "line": "ul. Lwowska 12",
    "city": "Nowy Sacz",
    "lat": 49.6178,
    "lng": 20.6920
  },
  "notes": "Prosze dzwonic przed przyjazdem"
}
```

Response (201):
```json
{
  "id": "bk...",
  "referenceCode": "OPN-4F2K",
  "status": "PENDING",
  "startAt": "2026-04-14T08:00:00Z",
  "totalPricePln": 180
}
```

Mozliwe bledy: `409 SlotAlreadyBooked`, `422 AddressOutsideServiceZone`, `422 VehicleNotOwned`, `429 RateLimitExceeded`.

**Flow płatności:**
1. `POST /v1/bookings` → tworzy Booking (PENDING) + Payment (INITIATED) + rezerwuje slot (15 min TTL).
2. Response zawiera `paymentUrl` → klient redirected do Przelewy24.
3. Klient placi (BLIK ~120s, karta ~30s).
4. Webhook `POST /v1/webhooks/p24` → Payment.status = COMPLETED → Booking widoczny dla providera.
5. Jesli brak płatności w 15 min → cron: Payment = FAILED, Booking = CANCELLED_BY_CLIENT, slot zwolniony.

**Dodatkowe endpointy płatności:**

| Method | Path | Opis |
|---|---|---|
| POST | `/v1/webhooks/p24` | Webhook Przelewy24 — potwierdzenie/odrzucenie płatności |
| GET | `/v1/bookings/:id/payment` | Status płatności (klient) |
| GET | `/v1/provider/me/payouts` | Lista wyplat providera (tygodniowe settlements) |
| GET | `/v1/provider/me/payouts/:id` | Szczegóły wyplaty (lista rezerwacji + kwoty) |

### 9.6. Panel Uslugodawcy (B2B)

Wymaga `PROVIDER_OWNER` lub `PROVIDER_STAFF`.

| Method | Path | Opis |
|---|---|---|
| GET | `/v1/provider/me` | Moja firma |
| PATCH | `/v1/provider/me` | Edytuj (opis, strefa, centrum) |
| GET / PUT | `/v1/provider/me/pricing` | Cennik (3 widelki) |
| GET / PUT | `/v1/provider/me/working-hours` | Godziny (7 dni) |
| GET / POST / DELETE | `/v1/provider/me/exceptions[/:id]` | Wyjatki |
| GET / POST / DELETE | `/v1/provider/me/photos[/:id]` | Galeria |
| GET | `/v1/provider/me/bookings` | Query: `?from=&to=&status=` |
| POST | `/v1/provider/me/bookings/:id/accept` | PENDING → CONFIRMED |
| POST | `/v1/provider/me/bookings/:id/reject` | Body: `{reason}` → REJECTED |
| POST | `/v1/provider/me/bookings/:id/start` | CONFIRMED → IN_PROGRESS |
| POST | `/v1/provider/me/bookings/:id/complete` | IN_PROGRESS → COMPLETED |
| POST | `/v1/provider/me/bookings/:id/cancel` | Body: `{reason}` |
| POST | `/v1/provider/me/bookings/:id/reschedule` | Body: `{newStartAt}` — propozycja zmiany |
| POST | `/v1/provider/me/reviews/:id/reply` | Body: `{reply}` |
| GET | `/v1/provider/me/stats` | Query: `?period=week\|month` — liczba rezerwacji, obrot, avgRating |

### 9.7. Onboarding usługodawcy

| Method | Path | Opis |
|---|---|---|
| POST | `/v1/provider/signup` | Body: `{companyName, nip, email, phone}` — tworzy User + Provider w `PENDING_NIP`. Email do komunikacji (Resend), nie do auth. |
| POST | `/v1/provider/me/verify-nip` | Wywołuje GUS API; w sukcesie → `PENDING_DOCS` |
| POST | `/v1/provider/me/docs` | Upload dokumentow (multipart); po uploadzie → `PENDING_APPROVAL` |

### 9.8. Admin

Wymaga `ADMIN`.

| Method | Path | Opis |
|---|---|---|
| GET | `/v1/admin/providers` | Query: `?status=PENDING_APPROVAL` |
| POST | `/v1/admin/providers/:id/approve` | → `APPROVED` |
| POST | `/v1/admin/providers/:id/reject` | Body: `{reason}` |
| POST | `/v1/admin/providers/:id/suspend` | Body: `{reason}` |
| POST | `/v1/admin/providers/:id/reinstate` | → `APPROVED` |
| GET | `/v1/admin/reviews` | Query: `?reported=true&hidden=false` |
| POST | `/v1/admin/reviews/:id/hide` | Ukryj opinie |
| GET | `/v1/admin/users/:id` | Profil + historia rezerwacji |
| POST | `/v1/admin/users/:id/ban` | Zbanuj klienta |
| GET | `/v1/admin/stats` | Globalny dashboard |

### 9.9. Zadania systemowe (cron, webhooks)

| Zadanie | Cadencja | Dzialanie |
|---|---|---|
| `markNoShows` | co 5 min | `CONFIRMED` + `startAt < NOW()-30min` → `NO_SHOW` + `noShowCount++` |
| `paymentTimeout` | co 1 min | `Payment.INITIATED` + `createdAt < NOW()-15min` → Payment FAILED, Booking CANCELLED, slot zwolniony (US-54) |
| `weeklyPayouts` | pon 6:00 | Batch payout: `Payment.payoutStatus=PENDING` + `Booking.COMPLETED` → przelew do providerów (US-55) |
| `otpCleanup` | co 15 min | Usun OTP z `expiresAt < NOW()` |
| `updateProviderRatingCache` | co 1 h | Przelicza `Provider.avgRating` / `reviewCount` |
| `autoSuspendProviders` | raz dziennie | Wykrywa providerów do zawieszenia |
| `adminPendingAlert` | codziennie 9:00 | Email do admina z lista zalegych `PENDING_APPROVAL` (US-20) |
| webhook: `sms-status` (Twilio) | event-driven | Logi dostarczenia SMS |
| webhook: `p24-notification` | event-driven | Potwierdzenie/odrzucenie płatności P24 → update Payment status |

### 9.10. Bezpieczenstwo i rate limiting

- OTP: max 3 proby / 15 min / phone.
- `POST /v1/bookings`: max 10 / godz. / klient.
- JWT access 15 min, refresh 30 dni.
- Autoryzacja: middleware `requireRole()` + `requireOwnership()` dla `:id` w sciezkach.
- CORS: tylko `opony.app` + `*.opony.app`.
- Wszystkie endpointy `/v1/provider/me/*` sprawdzaja `providerId` z JWT — klient nie moze podszyc sie pod innego providera.
- Dane osobowe (phone, email, address) → szyfrowane at-rest (pgcrypto), audytowane w `AuditLog`.

---

## 10. Integracje zewnetrzne

### 10.1. GUS BIR + CEIDG — weryfikacja NIP

**GUS BIR (Baza Internetowa REGON)** — oficjalne publiczne API RP dla danych rejestrowych firm.

**Użycie w aplikacji:**
1. Provider wpisuje NIP (10 cyfr).
2. Backend: call do GUS BIR → `{name, address, legalForm, pkd[], status}`.
3. Walidacja: `status == AKTYWNY` i PKD zawiera 45.20.Z (naprawa pojazdów) lub 52.21.Z (wspomagajaca transport).
4. Jesli OK → status providera `PENDING_NIP` → `PENDING_DOCS`.

**Setup GUS BIR:**
- Rejestracja klucza API (bezplatna, przez formularz na stronie GUS).
- Limit zapytan: historycznie szeroki; zweryfikuj przed produkcja.
- Response time: 1–5 s (synchroniczny).

**Fallback: CEIDG (dla JDG)**
Wiekszosc mobilnych punktow w Nowym Saczu to jednoosobowe dzialalnosci (JDG). GUS BIR zwraca minimum danych dla JDG — pelne dane (REGON, adres, data rozpoczecia, status) sa w CEIDG.

**Użycie CEIDG:**
1. Jesli GUS BIR zwraca `legalForm == 'OSOBA FIZYCZNA'` lub niekompletne dane → secondary call do CEIDG API.
2. CEIDG zwraca: pełna nazwa, adres korespondencyjny, status JDG, daty.
3. Setup: rejestracja klucza API CEIDG (bezplatna). Format: REST JSON.

**Uwaga prawna:** dane z GUS i CEIDG sa publiczne, ale nie eksponuj ich klientowi bez zgody providera (RODO — minimalizacja danych).

### 10.2. SMS — Twilio (startup) → SMSAPI.pl (docelowy)

**Faza 1: Twilio Programmable Messaging (MVP v0 launch)**

Konfiguracja:
1. Konto Twilio + business verification (wymagane dla PL).
2. Alfanumeryczny Sender ID „OPONY" (wymaga rejestracji operatorskiej w PL — 1–2 tyg.).
3. SDK `twilio` (npm) w backendzie NestJS.
4. Webhook `/v1/webhooks/twilio/sms-status` → delivery reports do `AuditLog`.

Koszty: ~0,30 PLN / SMS.

**Faza 2: migracja do SMSAPI.pl (po ~1 000 wyslanych SMS-ow)**

Dlaczego:
- ~60% taniej: 0,07–0,14 PLN / SMS (zalezy od pakietu).
- Lepsza deliverability w PL (polski operator, bezposrednie polaczenia z sieciami).
- Alfanumeryczny Sender ID bez dodatkowej rejestracji (juz w ekosystemie PL).

Konfiguracja:
1. Konto SMSAPI + weryfikacja firmy.
2. SDK `smsapi` (npm) lub REST API (prostsze).
3. Webhook na delivery reports (analogiczny jak Twilio).
4. Migracja: zamien serwis SMS w backendzie (interfejs abstrakcyjny `SmsService` → swap implementacji). ~1 dzien pracy.

**Compliance (oba):**
- OTP: krotkie, bez linku (antyphishing).
- Transakcyjne (potwierdzenia, przypomnienia): zawsze dozwolone.
- Marketing: opt-in wymagany, opt-out (`STOP` = reply-stop).
- Retencja logow SMS: 12 mc, potem anonimizacja.

**Architektura abstrakcji:**
```
interface SmsService {
  send(to: string, body: string): Promise<SmsResult>
  getDeliveryStatus(messageId: string): Promise<DeliveryStatus>
}

class TwilioSmsService implements SmsService { ... }
class SmsApiPlService implements SmsService { ... }
```
Podmiana przez DI (NestJS module) — zero zmian w logice biznesowej.

### 10.3. Email transakcyjny — Resend

**Użycie w v0:** potwierdzenia rezerwacji, notyfikacje providerow, raporty miesieczne, alerty admina.

Konfiguracja:
1. Konto Resend + weryfikacja domeny (`opony.app` → DNS records SPF/DKIM/DMARC).
2. SDK `resend` (npm) w backendzie.
3. Szablony email: plain-text + prosty HTML (potwierdzenie rez, notyfikacja providera, raport miesieczny, alert admina).

Koszty: free tier 3 000 emaili/mc → wystarczy na MVP. Potem ~$20/mc za 50k emaili.

Alternatywa: Postmark (lepsze delivery analytics), SendGrid (wieksza skala).

### 10.4. Retool — panel admina

**Dlaczego Retool:** zamiast budowac własny admin za 40+ SP, w 2–3 dni tworzymy ekrany CRUD na istniejacej bazie Postgres.

**Setup:**
1. Konto Retool Cloud (latwiejszy niz self-hosted; w v0 dane nie sa tajemica panstwowa).
2. Connection do Postgres (read-only user + zapisowy user dla akcji).
3. Aplikacje:
   - **Providers** — lista + filtry po statusie + akcje approve/reject/suspend (REST call do `/v1/admin/providers/:id/approve`).
   - **Bookings** — tabela + szczegóły + log audytu.
   - **Reviews** — moderacja (hide, zgloszenia z US-48).
   - **Users** — lista + ban.
   - **Dashboard** — SQL-queries + wykresy (rezerwacje dziennie, nowi providerzy, churn).
   - **Churn log** — providerzy, ktorzy odeszli (exit interview).

**Koszt:** Team plan ~$12–24/user/mc (1 user w MVP).

**Security:**
- RBAC w Retool (tylko role admin).
- Wszystkie akcje modyfikujace przez REST API (z audytem), nigdy direct SQL UPDATE.

### 10.5. Google Maps (MVP v0)

**Użycie:**
1. JS API (lista + mapa na PWA klienta) — `@googlemaps/js-api-loader`.
2. Geocoding (zamiana adresu klienta na lat/lng przy rezerwacji).
3. Places Autocomplete (autouzupelnianie adresu w formularzu rezerwacji).
4. Static Maps (embed miniatur na profilu providera dla SEO).
5. Directions URL (deep-link „Nawiguj" dla B2B — bez API, zero kosztu).

**Koszty (publiczne stawki, do zweryfikowania):**
- Map loads: $200/mc free credit → pokrywa ~28k map loads.
- Geocoding: ~$5 / 1000 requests.
- Places Autocomplete: ~$2.83 / 1000 sessions.
- Directions URL: free.

**Limit:** ustaw billing cap $50/mc w Cloud Console (hard cap zabezpieczajacy).

**Kontekst Nowy Sacz:** przy ~200 rez/mc i ~2000 MAU: ~5k map loads + ~400 geocoding = miesci sie w free credit.

**Migracja v1:** przy ekspansji na 3+ miast → Mapbox (tańsze per map load) + Nominatim (OpenStreetMap geocoding, self-hosted).

### 10.6. Przelewy24 — płatności online (MVP v0)

**Decyzja:** Przelewy24 jako primary payment provider. Powody:
- **Natywny BLIK** — najpopularniejsza metoda płatności online w PL (~70% e-commerce).
- **Tansze niz Stripe**: ~1,5% + 0,50 PLN vs Stripe ~2,9% + 1 PLN.
- **Marketplace mode** (split payments) — platforma automatycznie pobiera prowizje 8%, reszta do providera.

**Konfiguracja:**
1. Konto P24 (weryfikacja firmy, 3–5 dni roboczych).
2. Integracja REST API v2 — redirect flow (klient → P24 → bank/BLIK → callback → app).
3. Webhook `POST /v1/webhooks/p24` — potwierdzenie/odrzucenie płatności.
4. Konto sub-merchant per provider (P24 marketplace) LUB zbiorcze konto platformy + tygodniowe payouty reczne (prostsze w v0).

**Flow per rezerwacja:**
```
Klient klika "Potwierdz" → POST /v1/bookings → Booking PENDING + Payment INITIATED
     → redirect do P24 (paymentUrl)
     → klient wybiera BLIK / karte / przelew
     → P24 przetwarza
     → webhook /v1/webhooks/p24 → Payment COMPLETED
     → klient redirect na app → ekran potwierdzenia (US-10)
```

**Koszty:**
- Setup: 0 PLN (P24 nie pobiera oplaty aktywacyjnej).
- Per transakcja: ~1,5% + 0,50 PLN → przy 180 PLN = **~3,20 PLN**.
- Refundy: 0 PLN (P24 nie pobiera za refund).
- Payouty na konto providera: 0 PLN (przelew bankowy).

**Compliance:**
- PCI-DSS: nie dotyczy (hosted payment page, zero danych kart na naszym serwerze).
- SCA/3DS: obsługuje P24 automatycznie.
- RODO: dane transakcji → P24 jako procesor; umowa powierzenia.

**v1: Stripe jako fallback**
- Karty zagraniczne (turysci) — Stripe Elements.
- Apple Pay / Google Pay — Stripe.
- Koszty: 2,9% + 1 PLN → drozsze, ale szerszy zasięg.

### 10.7. Sentry — monitoring bledow

**Setup:**
1. Projekty: `opony-api`, `opony-client-pwa`, `opony-provider-web`.
2. SDK w kazdej apce + source maps upload w CI/CD.
3. Alerty:
   - \> 10 bledow 500 / 5 min → email do deva.
   - Crash-free < 99% → alert.
   - Nowy error type (first seen) → natychmiastowy alert.

**Koszt:** Developer plan ~$26/mc (wystarcza na MVP).

### 10.8. Observability stack (szkic)

```
 App / API
    │ events + errors
    ▼
 Sentry ← bledy + crashes (alerty)
 PostHog ← behawior uzytkownika (funnels: onboarding → booking)
 Resend Logs ← delivery status emaili
 Twilio/SMSAPI Logs ← delivery status SMS
 Railway Logs ← stdout/stderr backendu
 Retool Dashboard ← biznesowe KPI (SQL na Postgresie)
```

**Kluczowe funnele do sledzenia w PostHog (v0):**
1. `Landing → Signup (OTP) → Profile → Vehicle → First Booking` (klient).
2. `Provider Signup → NIP verify → Docs upload → Approved → First Booking received` (provider).
3. `Booking Created → Confirmed → Completed → Reviewed` (konwersja rezerwacji).

---

## 11. Decyzje architektoniczne (ADR)

### ADR-001: PWA zamiast React Native

- **Status:** Accepted
- **Kontekst:** MVP v0 ma walidować model biznesowy, nie zbudować natywną appke. Cel: szybki TTM (time to market) i walidacja w jednym miescie (Nowy Sacz).
- **Decyzja:** Next.js 14+ PWA dla klienta (mobile-first) i providera (desktop-first). Wspolna baza kodu frontend (monorepo z shared design-system i design-tokens).
- **Konsekwencje:**
  - (+) Skip App Store review (1–2 tyg. oszczednosci).
  - (+) Jedna baza kodu FE — szybsze iteracje.
  - (+) Instant updates — bez czekania na App Store deploy.
  - (-) Brak push notifications (SMS zamiast tego — i tak potrzebne).
  - (-) Ograniczone funkcje natywne (kamera, GPS background).
- **Rewizja:** v1 — dodanie React Native / Expo po walidacji (>100 rez/mc, >12 aktywnych providerów). PWA zostaje jako fallback.

### ADR-002: Przelewy24 zamiast Stripe

- **Status:** Accepted
- **Kontekst:** Płatności online sa kluczowe dla modelu biznesowego (prowizja 8%). Na polskim rynku BLIK dominuje (~70% e-commerce). Stripe wspiera BLIK, ale jest droższy i wymaga dodatkowej konfiguracji.
- **Decyzja:** Przelewy24 jako primary payment provider (natywny BLIK, marketplace mode).
- **Konsekwencje:**
  - (+) -50% koszt payment processing vs Stripe (~1,5%+0,50 PLN vs ~2,9%+1 PLN).
  - (+) Natywny BLIK — zero dodatkowej konfiguracji.
  - (+) Marketplace mode — automatyczny split płatności.
  - (-) Brak Apple Pay / Google Pay (Stripe ma).
  - (-) Slabsze SDK i dokumentacja vs Stripe.
- **Rewizja:** v1 — Stripe jako fallback dla kart zagranicznych i Apple/Google Pay.

### ADR-003: Haversine zamiast PostGIS

- **Status:** Accepted
- **Kontekst:** V0 obsługuje tylko mobilnych providerów z promieniowa strefa obsługi (np. 10 km od centrum miasta). PostGIS wymaga extension w Postgres, co komplikuje hosting (Railway standard Postgres).
- **Decyzja:** Haversine formula w raw SQL zamiast PostGIS extension.
- **Konsekwencje:**
  - (+) Prostszy hosting — Railway standard Postgres bez extensions.
  - (+) Wystarczający dla kola (promien) — jedyny shape w v0.
  - (-) Brak wsparcia dla polygon (nieregularne strefy).
  - (-) Wolniejsze niz PostGIS spatial index przy duzej skali.
- **Rewizja:** v1 — PostGIS z polygon strefami, gdy providerzy beda chcieli precyzyjne granice.

### ADR-004: Twilio startup → SMSAPI.pl docelowy

- **Status:** Accepted
- **Kontekst:** SMS to krytyczny kanal komunikacji (OTP, potwierdzenia, przypomnienia). Twilio jest globalny i szybki w setup, ale drogi dla polskiego rynku. SMSAPI.pl jest 60% tańszy i ma lepsza deliverability w PL.
- **Decyzja:** Twilio na start (fast setup, znane SDK), migracja do SMSAPI.pl po stabilizacji (~1000 SMS).
- **Konsekwencje:**
  - (+) Fast setup — Twilio dziala w 1 dzien.
  - (+) Interface `SmsService` → swap via DI — migracja bez zmian w logice biznesowej.
  - (-) Wyzszy koszt w fazie Twilio (~0,30 PLN vs ~0,10 PLN / SMS).
- **Rewizja:** Migracja po 1000 SMS lub $100 wydanych na Twilio.

### ADR-005: Custom JWT z unified SMS OTP strategy

- **Status:** Accepted (updated — usunięto LocalStrategy)
- **Kontekst:** Potrzebujemy auth dla dwoch typow uzytkownikow (klientow i providerow). Auth0/Clerk maja ograniczone wsparcie dla custom SMS OTP flow i dodaja koszt SaaS.
- **Decyzja:** Własny system JWT z jednym OtpStrategy (SMS OTP) w NestJS dla wszystkich uzytkownikow. Brak haseł — rola (CLIENT/PROVIDER_OWNER) pochodzi z `User.role` w DB. Wspólny JwtModule.
- **Konsekwencje:**
  - (+) Pełna kontrola nad flow auth.
  - (+) Zero kosztu SaaS (Auth0 free tier = 7500 MAU, ale custom SMS OTP jest platny).
  - (+) Jeden flow auth — prostszy kod, mniej powierzchni ataku (brak password storage).
  - (-) Odpowiedzialność za security (token rotation, rate limiting).
  - (-) Koszt SMS per login (mitigacja: refresh token 30 dni).
- **Rewizja:** Brak planów migracji. Jesli compliance wymusi → rozwazyc Auth0.

### ADR-006: Polling zamiast WebSocket

- **Status:** Accepted
- **Kontekst:** Klienci przegladaja sloty dostępnośći — potrzebna aktualizacja, zeby uniknac rezerwacji zajętego slotu. WebSocket daje real-time, ale wymaga infrastruktury (sticky sessions, Redis pub/sub).
- **Decyzja:** Polling co 30 sekund na endpointie availability.
- **Konsekwencje:**
  - (+) Prostsze — stateless, zero dodatkowej infrastruktury.
  - (+) Wystarczajace dla ~200 rez/mc i ~50 concurrent users.
  - (+) Partial unique index na DB zapobiega race condition nawet bez real-time.
  - (-) 30s delay w wyświetlaniu zajętych slotów.
  - (-) Więcej requestow do API niz WebSocket.
- **Rewizja:** v1 — WebSocket/SSE gdy concurrent users > 200.

### ADR-007: Retool zamiast wlasnego admin

- **Status:** Accepted
- **Kontekst:** Panel admina jest potrzebny (approve providerów, moderacja opinii, ban userow), ale budowanie wlasnego UI to ~40+ SP. W v0 admin to 1–2 osoby.
- **Decyzja:** Retool Cloud (konfiguracja GUI, nie kod). Polaczenie: Postgres (read) + REST API (write/actions).
- **Konsekwencje:**
  - (+) Oszczednosc ~40+ SP (~2 sprinty).
  - (+) Gotowy w 2–3 dni konfiguracji.
  - (+) SQL dashboardy out-of-the-box.
  - (-) Koszt ~$12–24/user/mc.
  - (-) Ograniczone customizacje UX.
- **Rewizja:** v1 — migracja na własny Next.js admin panel gdy potrzebna wieksza customizacja lub więcej adminow.

---

## 12. Ewolucja: MVP v0 → v1

MVP v0 validuje model biznesowy w Nowym Saczu. Po spełnieniu kryteriow sukcesu, architektura ewoluuje:

**Kryteria przejścia do v1:**
- \> 100 rezerwacji/mc w Nowym Saczu (~25/tydzien).
- \> 12 aktywnych providerów (MAU >= 1 rez/mc).
- NPS klientow > 30, < 15% no-show.
- TTFB < 7 dni dla nowych providerów.

**Planowane zmiany v1:**

| Obszar | MVP v0 | MVP v1 |
|---|---|---|
| Platforma klienta | PWA (Next.js) | + React Native / Expo (iOS + Android) |
| Typ providera | Tylko mobilny | + Stacjonarny (warsztaty) |
| Zasięg | 1 miasto (Nowy Sacz) | 3+ miast |
| Strefa obsługi | Promien (haversine) | Polygon (PostGIS) |
| Cache | Brak | Redis (sloty, sessions) |
| Płatności | P24 only | + Stripe (karty zagraniczne, Apple/Google Pay) |
| Sloty real-time | Polling 30s | WebSocket / SSE |
| Powiadomienia | SMS + email | + Push (FCM/APNs via Expo) |
| Mapy | Google Maps | + Mapbox (tańsze per load) |
| Admin | Retool Cloud | Własny Next.js admin panel |
| Profil pojazdu | Reczne wpisanie | Auto-fill z VIN (CEPIK API) |
| Trasy mobilne | Reczna kolejnosc | Mapbox Optimization API (VRP) |
