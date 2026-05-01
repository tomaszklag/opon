# Architektura MVP v0 — Opony.app

> Jeden spójny dokument architektury dla MVP v0. Miasto pilotażowe: Nowy Sącz (~85k mieszkańców). Stack: Expo + RNW (klient) + Next.js (panel + landing) + NestJS + PostgreSQL. Zespół: 4 agentów AI pracujących równolegle w sprintach. Zakres: ~122 SP MUST, 5–6 tygodni. **POC v0 BEZ płatności — aplikacja darmowa w pilocie, monetyzacja v0.5** (ADR-003).

---

## 1. Stack technologiczny (MVP v0)

| Warstwa               | Technologia                                     | Wersja         | Uzasadnienie                                                                                                                                                                   |
| --------------------- | ----------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Klient (mobile + web) | Expo SDK 50+ + React Native Web                 | Expo 50+       | **Jeden codebase iOS/Android/Web PWA** — v0 klient-only, v0.5/v1+ provider features w tej samej apce. Natywne apki day-1 via EAS build                                         |
| Provider portal       | Next.js (App Router)                            | 14+            | **Osobny desktop-first portal pod `panel.opony.app`** — ciężki admin (onboarding, cennik, godziny, strefa, finanse, rezerwacje). Responsive do browser mobilnego jako fallback |
| Landing               | Next.js (Static Export)                         | 14+            | SEO (`opony.app`, `/nowy-sacz`), szybki load, zero kosztu SSR                                                                                                                  |
| Backend API           | NestJS (Node.js)                                | 10+ (Node 20+) | TypeScript end-to-end, Prisma ORM, Swagger auto-docs, Dependency Injection                                                                                                     |
| ORM                   | Prisma                                          | 5+             | Type-safe queries, deklaratywne migrations, seeding                                                                                                                            |
| Baza danych           | PostgreSQL                                      | 16             | Bez PostGIS w v0 — haversine w raw SQL wystarczy dla promienia. ACID, partial unique index                                                                                     |
| SMS                   | Twilio (startup) → SMSAPI.pl (docelowy)         | —              | OTP, potwierdzenia, przypomnienia. Interface SmsService → swap via DI                                                                                                          |
| Email                 | Resend                                          | —              | Notyfikacje, potwierdzenia, raporty, alerty admina. Free tier 3k/mc                                                                                                            |
| Mapy                  | Google Maps JS API                              | —              | Embed, geocoding, Places Autocomplete. $200/mc free credit                                                                                                                     |
| Storage               | AWS S3                                          | —              | Zdjecia providerów, dokumenty, certyfikaty. Presigned URLs                                                                                                                     |
| Monitoring            | Sentry                                          | —              | Bledy + crashes, source maps, alerty                                                                                                                                           |
| Analytics             | PostHog (free tier)                             | —              | Funnele konwersji, retention. Self-serve                                                                                                                                       |
| Admin                 | Retool Cloud                                    | —              | CRUD na Postgres + REST API. Oszczednosc ~40+ SP                                                                                                                               |
| CI/CD                 | GitHub Actions                                  | —              | lint → test → build → deploy. Trunk-based development                                                                                                                          |
| Hosting               | Railway (API + Postgres), Vercel (Next.js apps) | —              | Zero DevOps, auto-scaling, preview deployments                                                                                                                                 |
| Monorepo              | Turborepo + pnpm                                | pnpm 9+        | Parallel builds, shared packages, cache                                                                                                                                        |
| Testy                 | Vitest + Playwright + MSW                       | —              | Unit/integration + E2E + API mocking                                                                                                                                           |
| Dokumentacja API      | Swagger (NestJS plugin) + Storybook             | —              | Auto-generated z decoratorow, component library                                                                                                                                |
| Design reference      | Static HTML mockups                             | 38 ekranów     | Source of truth dla FE — `/design/*.html` (industrial-dark, amber accent). Mapa w `plan-sprintow.md §12.Z`. Tokens ekstraktowane do `@opony/design-tokens` (patrz §7). ADR-008 |

**Czego NIE używamy w v0 (świadomie):**

| Technologia                             | Powod odrzucenia                                                      | Kiedy wejdzie                              |
| --------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------ |
| PWA (czyste Next.js) klient             | Expo + RNW daje mobile + web z jednego codebase — natywne apki gratis | — (zrezygnowano na rzecz Expo RNW)         |
| PostGIS                                 | Haversine wystarczy dla promienia                                     | v1 (polygon stref)                         |
| Redis                                   | Row lock w Postgres wystarczy                                         | v1 (cache slotów, sessions)                |
| WebSocket / SSE                         | Polling co 30s wystarczy dla ~200 rez/mc                              | v1                                         |
| Mapbox                                  | Google Maps ma $200/mc free credit                                    | v1 (3+ miast)                              |
| Przelewy24 (P24)                        | POC v0 bez płatności — aplikacja darmowa dla klientów i providerów    | v0.5/v1 (BLIK + karty + marketplace split) |
| Stripe                                  | Aplikacja v0 bez płatności                                            | v1 (karty zagraniczne, Apple/Google Pay)   |
| Auth0 / Clerk                           | Własny JWT = zero kosztu SaaS, pełna kontrola                         | nigdy (chyba ze compliance)                |
| CEPIK API                               | Reczne wpisanie rozmiaru opon w v0                                    | v1 (auto-fill z VIN)                       |
| Push notifications (Expo Notifications) | SMS wystarczy w v0; Expo Push natywnie gotowe od v0.5                 | v0.5 (accept PENDING w mobile)             |

---

## 2. Architektura wysokopoziomowa

### 2.1. Diagram komponentów (MVP v0)

```
                    ┌─────────────────────────────────────────────────────────┐
                    │                     FRONTEND (Vercel)                    │
                    │                                                         │
                    │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
                    │  │ Client App   │  │ Provider     │  │   Landing    │  │
                    │  │ Expo + RNW   │  │ Portal       │  │ (Next.js SG) │  │
                    │  │ iOS/Android/ │  │ (Next.js 14, │  │ opony.app    │  │
                    │  │  Web PWA     │  │  desktop)    │  │              │  │
                    │  │ /apps/mobile │  │/apps/panel   │  │/apps/landing │  │
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
              ┌────────┬───────┬───────┬─────────┬──────────┐
              │        │       │       │         │          │
         ┌────▼───┐ ┌──▼──┐ ┌─▼──┐ ┌──▼───┐ ┌──▼───┐ ┌───▼────┐
         │Postgres│ │Twilio│ │ S3 │ │Resend│ │Google│ │GUS/    │
         │  16    │ │(SMS) │ │    │ │      │ │ Maps │ │CEIDG   │
         └────────┘ └─────┘ └────┘ └──────┘ └──────┘ └────────┘

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
                         │  app.opony.app     → Vercel (Expo RNW web export)
                         │                       + natywne iOS/Android z tego samego repo
                         │  panel.opony.app   → Vercel (Next.js provider portal, desktop-first)
                         │  api.opony.app     → Railway (API)   │
                         └──────────────────────────────────────┘

┌─── Vercel ──────────────────────────────┐  ┌─── Railway ────────────────────┐
│                                         │  │                                │
│  ┌──────────┐ ┌───────────┐ ┌────────┐  │  │  ┌──────────┐  ┌───────────┐  │
│  │  Mobile  │ │  Panel    │ │Landing │  │  │  │ NestJS   │  │PostgreSQL │  │
│  │  Expo RNW│ │ Next.js   │ │ Static │  │  │  │ API      │  │   16      │  │
│  │  :19006  │ │  :3001    │ │ :3002  │  │  │  │ :4000    │  │  :5432    │  │
│  └──────────┘ └───────────┘ └────────┘  │  │  └──────────┘  └───────────┘  │
│                                         │  │                                │
│  Edge Functions, CDN, Preview Deploys   │  │  Auto-restart, Logging, Cron   │
└─────────────────────────────────────────┘  └────────────────────────────────┘

┌─── External Services ──────────────────────────────────────────────────────┐
│                                                                            │
│  Twilio (SMS)          │  AWS S3 eu-central-1 (storage)                    │
│  Resend (email)        │  Sentry (monitoring)                              │
│  PostHog (analytics)   │  Google Maps (mapy)                               │
│  GUS BIR / CEIDG (weryfikacja NIP)  │  Retool Cloud (admin)                │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.3. Komunikacja między serwisami

| From → To                       | Protocol                           | Auth                                          | Uwagi                                                         |
| ------------------------------- | ---------------------------------- | --------------------------------------------- | ------------------------------------------------------------- |
| Client App (Expo) → API         | REST/JSON (HTTPS)                  | Bearer JWT `role=CLIENT` (access 15 min)      | Polling co 30s dla slotów dostępności. JWT w Expo SecureStore |
| Provider Portal (Next.js) → API | REST/JSON (HTTPS)                  | Bearer JWT `role=PROVIDER` (access 15 min)    | Guard wymaga `status=APPROVED`; 403 jeśli PENDING_APPROVAL    |
| Landing → API                   | Brak (statyczny)                   | —                                             | Formularz waitlist → POST /v1/waitlist                        |
| API → PostgreSQL                | Prisma Client                      | Connection string                             | Connection pool (Railway managed)                             |
| API → Twilio                    | HTTPS (Twilio SDK)                 | env TWILIO_SID + TWILIO_AUTH_TOKEN            | Sender ID: „OPONY"                                            |
| API → S3                        | AWS SDK v3                         | env AWS_ACCESS_KEY_ID + AWS_SECRET_ACCESS_KEY | Presigned URLs (upload + download)                            |
| API → Resend                    | HTTPS (Resend SDK)                 | env RESEND_API_KEY                            | Domena: opony.app (SPF/DKIM/DMARC)                            |
| API → Google Maps               | HTTPS                              | env GOOGLE_MAPS_API_KEY                       | Geocoding + Places Autocomplete (server-side)                 |
| API → GUS/CEIDG                 | HTTPS REST                         | env GUS_API_KEY                               | Weryfikacja NIP przy onboardingu                              |
| Twilio → API                    | Webhook POST /v1/webhooks/twilio   | Twilio signature verification                 | Delivery reports SMS                                          |
| Retool → PostgreSQL             | Direct connection (read-only user) | DB credentials                                | Dashboardy, raporty SQL                                       |
| Retool → API                    | REST/JSON                          | Admin JWT / API key                           | Akcje: approve/reject/suspend/ban                             |

### 2.4. Auth & role-based routing

JWT access token zawiera `role: CLIENT | PROVIDER` + `status: APPROVED | PENDING_APPROVAL | SUSPENDED` (dla providerów).

**Mobile app (Expo + RNW)** akceptuje oba role przy logowaniu:

- `role=CLIENT` — pokazuje ekrany klienta (Home/Rezerwacje/Profil), brak dostępu do feature'ów providera
- `role=PROVIDER` + `status=APPROVED` — w v0: ekran informacyjny „Zarządzaj warsztatem w panelu" + deep-link do `panel.opony.app`; w v0.5+: dodatkowa zakładka tabs „Dzień" z dashboardem (W:12.5)
- `role=PROVIDER` + `status=PENDING_APPROVAL` — ekran blokady z info o czasie weryfikacji 24h (US-24)

**Panel portal (Next.js)** odrzuca login klienta: po `POST /v1/auth/otp-verify` jeśli `role !== PROVIDER` → `403 FORBIDDEN` z `{ detail: "Ten portal jest dla warsztatów. Zaloguj się w aplikacji klienta." }` + link do `app.opony.app`.

**Jeden numer telefonu = jedna rola w v0.** Wielorolowość (pracownik warsztatu ma też konto klienta na tym samym numerze) wymaga `UserRoleBinding[]` i jest scope'owana na v1+.

**Deep-linking:**

- `opony://panel` (iOS Universal Links + Android App Links) → otwiera `panel.opony.app/dashboard` w domyślnej przeglądarce (webview wewnątrz Expo apki)
- `apple-app-site-association` i `assetlinks.json` hostowane na `app.opony.app/.well-known/` (konfiguracja Expo `app.json`)

### 2.5. CORS i subdomain scoping

**API CORS origins (whitelista):**

```
https://opony.app
https://app.opony.app
https://panel.opony.app
exp://...  (Expo dev client)
http://localhost:19006  (Expo web dev)
http://localhost:3001   (Panel dev)
http://localhost:3002   (Landing dev)
```

**Token storage:**

- Mobile (Expo native): `expo-secure-store` — szyfrowany keychain/keystore
- Mobile (web export): `localStorage` z prefiks `opony_` (brak httpOnly cookies bo Expo+RNW = SPA)
- Panel (Next.js): `httpOnly cookie` na `.opony.app` (scoping do subdomen)

**Rate limits (API gateway):**

- OTP: 3 req / 15 min / phone (US-01)
- Login: 5 req / 15 min / IP
- Public endpoints (provider listing): 100 req / min / IP

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
│   │   │   ├── booking/        — rezerwacje + state machine + auto-expiry
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
│   ├── mobile/                 — Expo SDK 50 (iOS + Android + Web PWA) — klient v0, +provider features v0.5/v1
│   │   ├── app/                — expo-router (file-based routing)
│   │   │   ├── (auth)/         — login (SMS OTP), OTP entry, consent
│   │   │   ├── (client)/       — search, booking, profile (role=CLIENT)
│   │   │   └── (provider)/     — dashboard dnia, etc. (role=PROVIDER) — v0 puste + deep-link do panel, v0.5+ real screens
│   │   ├── components/         — RN StyleSheet
│   │   ├── lib/
│   │   ├── assets/
│   │   │   └── .well-known/    — apple-app-site-association, assetlinks.json
│   │   ├── app.json            — Expo config (bundle id, scheme opony://)
│   │   └── mocks/              — MSW handlers (dev)
│   ├── panel/                  — Next.js 14 provider portal (panel.opony.app, desktop-first)
│   │   ├── app/
│   │   │   ├── (auth)/         — login (SMS OTP — provider only), blocked (PENDING_APPROVAL)
│   │   │   ├── (onboarding)/   — signup wizard 3 kroki
│   │   │   └── (main)/         — dashboard, pricing, hours, zone, finance, settings
│   │   ├── components/         — CSS-in-JS / Tailwind
│   │   └── mocks/
│   └── landing/                — Next.js 14 static (opony.app, SEO)
│       ├── app/
│       │   ├── page.tsx        — hero + CTA + waitlist
│       │   └── layout.tsx
│       └── components/
├── packages/
│   ├── shared-types/           — TS interfaces + enums (DTO, Role, Status)
│   ├── design-tokens/          — JSON (colors, spacing, typography, radii, shadows) — single source of truth
│   ├── design-system-native/   — React Native StyleSheet komponenty (Button, Card, Chip, Input, Modal...) dla apps/mobile
│   ├── design-system-web/      — CSS/Tailwind komponenty dla apps/panel + apps/landing
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

| Pakiet                   | Sciezka                          | Odpowiedzialność                                                                                                                                                                          |
| ------------------------ | -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **shared-types**         | `/packages/shared-types`         | Współdzielone interfejsy TS i enumy (BookingStatus, ProviderStatus, UserRole, DTO types). Importowane przez api, mobile, panel, landing, api-client.                                      |
| **design-tokens**        | `/packages/design-tokens`        | JSON z tokenami designu (colors, spacing, radii, typography, shadows) — **single source of truth**. Build script syncuje do design-system-native i design-system-web.                     |
| **design-system-native** | `/packages/design-system-native` | React Native StyleSheet komponenty (Button, Card, Chip, Input, Modal, BottomNav, Spinner, Toast, EmptyState) — dla `apps/mobile` (Expo + RNW).                                            |
| **design-system-web**    | `/packages/design-system-web`    | CSS / Tailwind komponenty (Button, Input, Badge, Card, Sidebar, DataTable, Modal, Form, Toast) — dla `apps/panel` (desktop-first) i `apps/landing`. Wizualnie 1:1 z design-system-native. |
| **api-client**           | `/packages/api-client`           | Typed fetch wrapper generowany z OpenAPI spec (Swagger). Zapewnia type-safe wywolania API w mobile, panel i landing.                                                                      |
| **eslint-config**        | `/packages/eslint-config`        | Wspoldzielona konfiguracja ESLint + Prettier.                                                                                                                                             |

---

## 4. Setup guide — od zera do running dev

### 4.1. Wymagania systemowe

| Narzedzie      | Wersja    | Uwagi                                             |
| -------------- | --------- | ------------------------------------------------- |
| Node.js        | 20+ (LTS) | Wymagane przez NestJS 10 i Next.js 14             |
| pnpm           | 9+        | Monorepo workspace manager                        |
| Docker Desktop | Latest    | Dla Postgres 16 + Mailpit (lokalny email preview) |
| Git            | 2.40+     | —                                                 |

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

| Serwis         | URL                             | Dane logowania                                |
| -------------- | ------------------------------- | --------------------------------------------- |
| Client PWA     | `http://localhost:3000`         | Login: `+48 111 111 111` (test OTP: `123456`) |
| Provider panel | `http://localhost:3001`         | Login: `+48 222 222 222` (test OTP: `123456`) |
| Landing        | `http://localhost:3002`         | — (publiczny)                                 |
| API Swagger    | `http://localhost:4000/v1/docs` | — (publiczny w dev)                           |
| Mailpit        | `http://localhost:8025`         | — (preview wszystkich emaili)                 |
| PostgreSQL     | `localhost:5432`                | DB: `opony` / User: `opony` / Pass: `opony`   |

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

| Zmienna                       | Opis                                  | Wymagana   | Przyklad                                        |
| ----------------------------- | ------------------------------------- | ---------- | ----------------------------------------------- |
| `DATABASE_URL`                | Connection string do PostgreSQL       | Tak        | `postgresql://opony:opony@localhost:5432/opony` |
| `JWT_SECRET`                  | Secret do podpisywania access tokenow | Tak        | `super-secret-jwt-key-min-32-chars`             |
| `JWT_REFRESH_SECRET`          | Secret do refresh tokenow             | Tak        | `super-secret-refresh-key-min-32-chars`         |
| `TWILIO_SID`                  | Twilio Account SID                    | Tak (prod) | `AC...`                                         |
| `TWILIO_AUTH_TOKEN`           | Twilio Auth Token                     | Tak (prod) | `...`                                           |
| `TWILIO_PHONE`                | Twilio phone number lub Sender ID     | Tak (prod) | `OPONY` lub `+48...`                            |
| `RESEND_API_KEY`              | Resend API Key                        | Tak (prod) | `re_...`                                        |
| `AWS_S3_BUCKET`               | Nazwa bucketu S3                      | Tak (prod) | `opony-uploads-prod`                            |
| `AWS_ACCESS_KEY_ID`           | AWS Access Key                        | Tak (prod) | `AKIA...`                                       |
| `AWS_SECRET_ACCESS_KEY`       | AWS Secret Key                        | Tak (prod) | `...`                                           |
| `AWS_REGION`                  | AWS Region                            | Tak        | `eu-central-1`                                  |
| `SENTRY_DSN`                  | Sentry DSN (per projekt)              | Tak (prod) | `https://...@sentry.io/...`                     |
| `GOOGLE_MAPS_API_KEY`         | Google Maps API Key (server-side)     | Tak (prod) | `AIza...`                                       |
| `GUS_API_KEY`                 | Klucz API GUS BIR                     | Tak (prod) | `...`                                           |
| `NEXT_PUBLIC_API_URL`         | URL backendu dla frontendow           | Tak        | `http://localhost:4000/v1`                      |
| `NEXT_PUBLIC_API_MOCK`        | Wlacz MSW mocking (true/false)        | Nie        | `true`                                          |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | Google Maps API Key (client-side)     | Tak (prod) | `AIza...`                                       |
| `NEXT_PUBLIC_POSTHOG_KEY`     | PostHog API Key                       | Nie        | `phc_...`                                       |
| `NEXT_PUBLIC_SENTRY_DSN`      | Sentry DSN (frontend)                 | Nie        | `https://...@sentry.io/...`                     |

**Uwaga:** W trybie dev (`NEXT_PUBLIC_API_MOCK=true`) MSW przechwytuje requesty API — nie potrzebujesz prawdziwych kluczy Twilio/S3.

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
├── BookingModule (CRUD, state machine, auto-expiry)
│   └── SmsModule
├── ReviewModule
├── UploadModule (S3 presigned URLs)
├── AdminModule
├── CronModule
│   ├── NoShowCron
│   ├── BookingExpiryCron        (PENDING > 24h = auto-cancel, zastępuje PaymentTimeoutCron)
│   ├── RatingCacheCron
│   └── AdminAlertCron
└── CommonModule (filters, interceptors, pipes)
```

### 5.2. Wzorce i konwencje

| Wzorzec                  | Implementacja                                                              | Przyklad                                                                   |
| ------------------------ | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Dependency Injection** | NestJS IoC, interfejsy z `@Inject` token                                   | `SmsService` → `TwilioSmsService` (swappable na `SmsApiPlService`)         |
| **Guards**               | Custom decorators + CanActivate                                            | `@RequireRole(CLIENT)`, `@RequireProviderOwner()`, `@Public()`             |
| **Interceptors**         | NestJS interceptors                                                        | `AuditLogInterceptor` — każda zmiana Booking/Provider → `AuditLog`         |
| **Exception Filters**    | `GlobalHttpExceptionFilter`                                                | RFC 7807 Problem Details (`type`, `title`, `status`, `detail`, `instance`) |
| **Validation (DTO)**     | `class-validator` + `class-transformer`                                    | `@IsNotEmpty()`, `@IsPhoneNumber('PL')`, `@IsUUID()` na każdym DTO         |
| **Business validation**  | Zod schemas                                                                | Complex rules (np. walidacja slotu, adresu w strefie)                      |
| **Cron jobs**            | NestJS `@Cron` decorator + `ScheduleModule`                                | `@Cron('*/5 * * * *') markNoShows()`                                       |
| **Prisma usage**         | PrismaService extends PrismaClient, `onModuleInit`                         | `$transaction` dla operacji atomowych, `$queryRaw` dla haversine           |
| **Naming**               | `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.dto.ts`, `*.guard.ts` | Standardowa konwencja NestJS                                               |
| **Error codes**          | Enum `ErrorCode` w `shared-types`                                          | `SLOT_ALREADY_BOOKED`, `ADDRESS_OUTSIDE_ZONE`, `PROVIDER_NOT_APPROVED`     |

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

#### 4. Booking expiry (POC v0, zastępuje payment timeout)

**Problem:** Provider nie akceptuje rezerwacji PENDING w SLA (2h) → klient czeka w próżni.

**Rozwiązanie:** Cron `bookingExpiryCron` co 10 min:

- `Booking.status == PENDING AND createdAt < NOW() - INTERVAL '2 hours'`
- → `Booking.status = CANCELLED_BY_SYSTEM`
- → SMS do klienta („Provider nie odpowiedział — wybierz inny")
- → Slot zwolniony (usuwany constraint)

W v0 bez płatności nie ma race condition „zapłacił/nie zapłacił" — timeout dotyczy tylko akceptacji providera.

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

| Pole         | Typ         | Opis                                                          |
| ------------ | ----------- | ------------------------------------------------------------- |
| `sub`        | UUID        | ID uzytkownika (User.id)                                      |
| `role`       | enum        | `CLIENT`, `PROVIDER_OWNER`, `ADMIN` — rola z `User.role` w DB |
| `providerId` | UUID / null | ID firmy providera (tylko dla PROVIDER_OWNER)                 |
| `iat`        | timestamp   | Issued at                                                     |
| `exp`        | timestamp   | Expiration — access: +15 min, refresh: +30 dni                |

### 6.4. Guard logic

| Decorator                      | Logika                                                                          | Użycie                                     |
| ------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------ |
| `@Public()`                    | Skip auth — endpoint publiczny                                                  | `GET /v1/providers`, `POST /v1/auth/otp/*` |
| `@RequireRole(CLIENT)`         | Sprawdz `role == CLIENT` z JWT                                                  | `POST /v1/bookings`, `GET /v1/me`          |
| `@RequireRole(PROVIDER_OWNER)` | Sprawdz `role == PROVIDER_OWNER`                                                | `GET /v1/provider/me`                      |
| `@RequireProviderOwner()`      | `role == PROVIDER_OWNER` + `providerId != null` + `Provider.status == APPROVED` | `POST /v1/provider/me/bookings/:id/accept` |
| `@RequireRole(ADMIN)`          | Sprawdz `role == ADMIN`                                                         | `POST /v1/admin/providers/:id/approve`     |

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

| Komponent        | Props                                                         | Użycie                                      | Warianty                                  |
| ---------------- | ------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------- |
| **Button**       | `variant`, `size`, `disabled`, `loading`, `icon`, `fullWidth` | CTA, formularze, akcje                      | `primary`, `secondary`, `ghost`, `danger` |
| **Input**        | `label`, `error`, `hint`, `type`, `disabled`, `icon`          | Formularze logowania, wyszukiwania, profilu | `text`, `password`, `tel`, `search`       |
| **Badge**        | `variant`, `size`, `dot`                                      | Status rezerwacji, status providera         | kolory per status (patrz 7.3)             |
| **Card**         | `padding`, `shadow`, `onClick`, `href`                        | Lista providerów, rezerwacje, cennik        | `default`, `interactive`, `outlined`      |
| **Modal**        | `isOpen`, `onClose`, `title`, `size`                          | Potwierdzenie anulowania, szczegóły         | `sm`, `md`, `lg`                          |
| **BottomTabBar** | `items`, `activeIndex`                                        | Nawigacja klienta PWA (mobile)              | —                                         |
| **SideMenu**     | `items`, `activeItem`, `collapsed`                            | Nawigacja provider panel (desktop)          | `expanded`, `collapsed`                   |
| **Spinner**      | `size`, `color`                                               | Ladowanie danych, submit                    | `sm`, `md`, `lg`                          |
| **Toast**        | `message`, `variant`, `duration`, `onClose`                   | Potwierdzenia, bledy, info                  | `success`, `error`, `warning`, `info`     |
| **EmptyState**   | `icon`, `title`, `description`, `action`                      | Brak rezerwacji, brak wynikow               | —                                         |

### 7.3. Status Badge kolory

| Status                  | Kolor     | Token        | Kontekst                          |
| ----------------------- | --------- | ------------ | --------------------------------- |
| `PENDING`               | Zolty     | `warning`    | Rezerwacja oczekuje na akceptacje |
| `CONFIRMED`             | Zielony   | `success`    | Provider zaakceptowal             |
| `IN_PROGRESS`           | Niebieski | `primary`    | Usluga w trakcie                  |
| `COMPLETED`             | Szary     | `neutral500` | Zakonczono                        |
| `CANCELLED_BY_CLIENT`   | Czerwony  | `error`      | Klient anulowal                   |
| `CANCELLED_BY_PROVIDER` | Czerwony  | `error`      | Provider anulowal                 |
| `NO_SHOW`               | Szary     | `neutral400` | Klient nie pojawil sie            |
| `REJECTED`              | Czerwony  | `error`      | Provider odrzucil                 |

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
  bankAccountIban VARCHAR(34) NULL        -- OPCJONALNE w v0 (zbieramy na v0.5 rozliczenia)
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
  -- v0: brak pola paymentMethod — klient płaci offline providerowi bezpośrednio (v0.5+ wróci ONLINE_BLIK/CARD/TRANSFER)
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

-- Tabela Payment USUNIĘTA w v0 (POC bez płatności, ADR-003).
-- W v0.5+ wróci z polami: externalId, method, status, amountPln, feePln, commissionPln, providerPayoutPln, payoutStatus.

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

| Z           | Do                    | Kto                     | Warunki                                           |
| ----------- | --------------------- | ----------------------- | ------------------------------------------------- |
| —           | PENDING               | klient (create)         | slot wolny, adres w strefie, klient nie zbanowany |
| PENDING     | CONFIRMED             | provider (accept)       | —                                                 |
| PENDING     | REJECTED              | provider (reject)       | powod wymagany                                    |
| PENDING     | CANCELLED_BY_CLIENT   | klient                  | > 2h przed startAt                                |
| CONFIRMED   | CANCELLED_BY_CLIENT   | klient                  | > 2h przed startAt; ponizej → `noShowCount++`     |
| CONFIRMED   | CANCELLED_BY_PROVIDER | provider                | powod wymagany                                    |
| CONFIRMED   | IN_PROGRESS           | provider (start)        | —                                                 |
| IN_PROGRESS | COMPLETED             | provider (complete)     | —                                                 |
| CONFIRMED   | NO_SHOW               | system (cron, co 5 min) | `startAt < NOW() - 30min` i brak `IN_PROGRESS`    |

**Niezmienniki:**

- Stan terminalny (COMPLETED, CANCELLED\_\*, NO_SHOW, REJECTED) → `status` i kluczowe pola sa immutable.
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

| Method | Path                   | Opis                                                                                  |
| ------ | ---------------------- | ------------------------------------------------------------------------------------- |
| POST   | `/v1/auth/otp/request` | Body: `{phone}` → 204. Rate limit: 3/15 min/phone.                                    |
| POST   | `/v1/auth/otp/verify`  | Body: `{phone, code}` → `{accessToken, refreshToken, user, requiresConsent}` lub 401. |
| POST   | `/v1/auth/refresh`     | Body: `{refreshToken}` → `{accessToken, refreshToken}`.                               |
| POST   | `/v1/auth/logout`      | → 204. Unieważnia refresh.                                                            |

### 9.2b. Auth (provider — SMS OTP)

Providerzy używają tych samych endpointów auth co klienci (sekcja 9.2). Po zalogowaniu SMS OTP, JWT zawiera `role=PROVIDER_OWNER` i `providerId`.

Brak oddzielnych endpointów `/v1/provider/auth/*` — cały flow przez `/v1/auth/otp/*`.

### 9.3. Profil klienta

| Method | Path                  | Opis                                                                                            |
| ------ | --------------------- | ----------------------------------------------------------------------------------------------- |
| GET    | `/v1/me`              | Zwraca `{id, phone, email, firstName, lastName, role}`                                          |
| PATCH  | `/v1/me`              | Body: `{firstName?, lastName?, email?}`                                                         |
| POST   | `/v1/me/consent`      | Body: `{terms: true, privacy: true, marketing?: false}` → 201. Wymagane po pierwszym logowaniu. |
| GET    | `/v1/me/vehicles`     | Lista pojazdów                                                                                  |
| POST   | `/v1/me/vehicles`     | Body: `{nickname, tireSize}` → 201                                                              |
| PATCH  | `/v1/me/vehicles/:id` | —                                                                                               |
| DELETE | `/v1/me/vehicles/:id` | → 204                                                                                           |

### 9.4. Katalog usługodawcow (publiczny — bez auth)

| Method | Path                               | Opis                                                                                                                                   |
| ------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/v1/providers`                    | Query: `city, lat, lng, tireSize, date, sort=distance\|price\|rating, page`. Zwraca liste z obliczonym dystansem i najblizszym slotem. |
| GET    | `/v1/providers/:slug`              | Szczegóły + cennik + godziny + top 3 opinie                                                                                            |
| GET    | `/v1/providers/:slug/reviews`      | Paginowane opinie. Query: `?page=&sort=newest\|rating_desc`                                                                            |
| GET    | `/v1/providers/:slug/availability` | Dostępność slotów. Query: `?from=2026-04-14&to=2026-04-20&tireSize=205/55R16&clientLat=&clientLng=`                                    |

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

| Method | Path                      | Opis                                                                                                                                            |
| ------ | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| POST   | `/v1/bookings`            | Utwórz rezerwację (status=PENDING). Naglowek: `Idempotency-Key`. Zwraca `{booking}`. W v0 bez płatności — provider accept w 2h lub auto-cancel. |
| GET    | `/v1/me/bookings`         | Query: `?status=upcoming\|past\|all&page=`                                                                                                      |
| GET    | `/v1/bookings/:id`        | Szczegóły (sprawdzenie ownership)                                                                                                               |
| POST   | `/v1/bookings/:id/cancel` | Body: `{reason}` — klient anuluje                                                                                                               |
| POST   | `/v1/bookings/:id/review` | Body: `{rating:1–5, comment}` — tylko COMPLETED                                                                                                 |

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
    "lng": 20.692
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

**Flow rezerwacji (v0, bez płatności):**

1. `POST /v1/bookings` → tworzy Booking (PENDING) + rezerwuje slot.
2. Response zawiera `{booking}` → klient widzi „Oczekuje akceptacji providera".
3. Provider dostaje SMS/push → akceptuje (CONFIRMED) lub odrzuca (REJECTED).
4. Jesli provider nie odpowie w 2h → cron `bookingExpiryCron`: Booking = CANCELLED_BY_SYSTEM, SMS do klienta („Provider nie odpowiedział — wybierz inny"), slot zwolniony.
5. Po wizycie — klient płaci providerowi offline (gotówka/przelew). Platforma zarabia 0% w pilocie.

**v0 — brak endpointów płatności.** Aplikacja darmowa w pilocie (ADR-003). W v0.5+ wrócą endpointy:

- `POST /v1/webhooks/p24`, `GET /v1/bookings/:id/payment` (status BLIK)
- `GET /v1/provider/me/payouts[/:id]` (tygodniowe wypłaty)

### 9.6. Panel Uslugodawcy (B2B)

Wymaga `PROVIDER_OWNER` lub `PROVIDER_STAFF`.

| Method              | Path                                      | Opis                                                               |
| ------------------- | ----------------------------------------- | ------------------------------------------------------------------ |
| GET                 | `/v1/provider/me`                         | Moja firma                                                         |
| PATCH               | `/v1/provider/me`                         | Edytuj (opis, strefa, centrum)                                     |
| GET / PUT           | `/v1/provider/me/pricing`                 | Cennik (3 widelki)                                                 |
| GET / PUT           | `/v1/provider/me/working-hours`           | Godziny (7 dni)                                                    |
| GET / POST / DELETE | `/v1/provider/me/exceptions[/:id]`        | Wyjatki                                                            |
| GET / POST / DELETE | `/v1/provider/me/photos[/:id]`            | Galeria                                                            |
| GET                 | `/v1/provider/me/bookings`                | Query: `?from=&to=&status=`                                        |
| POST                | `/v1/provider/me/bookings/:id/accept`     | PENDING → CONFIRMED                                                |
| POST                | `/v1/provider/me/bookings/:id/reject`     | Body: `{reason}` → REJECTED                                        |
| POST                | `/v1/provider/me/bookings/:id/start`      | CONFIRMED → IN_PROGRESS                                            |
| POST                | `/v1/provider/me/bookings/:id/complete`   | IN_PROGRESS → COMPLETED                                            |
| POST                | `/v1/provider/me/bookings/:id/cancel`     | Body: `{reason}`                                                   |
| POST                | `/v1/provider/me/bookings/:id/reschedule` | Body: `{newStartAt}` — propozycja zmiany                           |
| POST                | `/v1/provider/me/reviews/:id/reply`       | Body: `{reply}`                                                    |
| GET                 | `/v1/provider/me/stats`                   | Query: `?period=week\|month` — liczba rezerwacji, obrot, avgRating |

### 9.7. Onboarding usługodawcy

| Method | Path                         | Opis                                                                                                                           |
| ------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/v1/provider/signup`        | Body: `{companyName, nip, email, phone}` — tworzy User + Provider w `PENDING_NIP`. Email do komunikacji (Resend), nie do auth. |
| POST   | `/v1/provider/me/verify-nip` | Wywołuje GUS API; w sukcesie → `PENDING_DOCS`                                                                                  |
| POST   | `/v1/provider/me/docs`       | Upload dokumentow (multipart); po uploadzie → `PENDING_APPROVAL`                                                               |

### 9.8. Admin

Wymaga `ADMIN`.

| Method | Path                                | Opis                                 |
| ------ | ----------------------------------- | ------------------------------------ |
| GET    | `/v1/admin/providers`               | Query: `?status=PENDING_APPROVAL`    |
| POST   | `/v1/admin/providers/:id/approve`   | → `APPROVED`                         |
| POST   | `/v1/admin/providers/:id/reject`    | Body: `{reason}`                     |
| POST   | `/v1/admin/providers/:id/suspend`   | Body: `{reason}`                     |
| POST   | `/v1/admin/providers/:id/reinstate` | → `APPROVED`                         |
| GET    | `/v1/admin/reviews`                 | Query: `?reported=true&hidden=false` |
| POST   | `/v1/admin/reviews/:id/hide`        | Ukryj opinie                         |
| GET    | `/v1/admin/users/:id`               | Profil + historia rezerwacji         |
| POST   | `/v1/admin/users/:id/ban`           | Zbanuj klienta                       |
| GET    | `/v1/admin/stats`                   | Globalny dashboard                   |

### 9.9. Zadania systemowe (cron, webhooks)

| Zadanie                        | Cadencja        | Dzialanie                                                                                                                  |
| ------------------------------ | --------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `markNoShows`                  | co 5 min        | `CONFIRMED` + `startAt < NOW()-30min` → `NO_SHOW` + `noShowCount++`                                                        |
| `bookingExpiry`                | co 10 min       | `PENDING` + `createdAt < NOW()-2h` → `CANCELLED_BY_SYSTEM`, SMS do klienta, slot zwolniony (zastępuje paymentTimeout w v0) |
| `otpCleanup`                   | co 15 min       | Usun OTP z `expiresAt < NOW()`                                                                                             |
| `updateProviderRatingCache`    | co 1 h          | Przelicza `Provider.avgRating` / `reviewCount`                                                                             |
| `autoSuspendProviders`         | raz dziennie    | Wykrywa providerów do zawieszenia                                                                                          |
| `adminPendingAlert`            | codziennie 9:00 | Email do admina z lista zalegych `PENDING_APPROVAL` (US-20)                                                                |
| webhook: `sms-status` (Twilio) | event-driven    | Logi dostarczenia SMS                                                                                                      |
| ~~`weeklyPayouts`~~            | —               | W v0 brak — apka darmowa, bez rozliczeń (wróci w v0.5)                                                                     |

### 9.10. Bezpieczenstwo i rate limiting

- OTP: max 3 proby / 15 min / phone.
- `POST /v1/bookings`: max 10 / godz. / klient.
- JWT access 15 min, refresh 30 dni.
- Autoryzacja: middleware `requireRole()` + `requireOwnership()` dla `:id` w sciezkach.
- CORS: tylko `opony.app` + `*.opony.app`.
- Wszystkie endpointy `/v1/provider/me/*` sprawdzaja `providerId` z JWT — klient nie moze podszyc sie pod innego providera.
- Dane osobowe (phone, email, address) → szyfrowane at-rest (pgcrypto), audytowane w `AuditLog`.

---

## 9.A. Kontrakt typów API — warstwa `api-data-access` (OBOWIĄZKOWE)

> **Zasada:** typy żądań i odpowiedzi API są zawsze generowane ze schematu OpenAPI — nigdy definiowane ręcznie we frontendzie. Złamanie tej zasady powoduje dryfowanie typów przy każdej zmianie BE.

### 9.A.1. Jak działa pipeline

```
NestJS controller
  └─ @ApiResponse({ type: XxxResponseDto })   ← deklaruje typ odpowiedzi w Swagger
       └─ /v1/docs-json                        ← runtime Swagger JSON
            └─ pnpm generate:api-client         ← openapi-typescript
                 └─ packages/api-client/src/schema.d.ts   ← generated types
                      └─ api-data-access/*.ts   ← aliasy komponentów schema
                           └─ app pages / components       ← konsumenci
```

### 9.A.2. Obowiązki agenta BE (każdy nowy endpoint)

**BEZWZGLĘDNIE WYMAGANE** — bez tego typy odpowiedzi nie trafią do schematu:

1. Utwórz plik `src/<modul>/dto/<modul>-response.dto.ts` z klasą `XxxResponseDto`:
   - Każde pole z `@ApiProperty()` lub `@ApiPropertyOptional()`
   - Pola opcjonalne / nullable: `@ApiPropertyOptional({ type: String, nullable: true })`
   - Pola numeryczne: zawsze `{ type: Number }` (inaczej Swagger nie inferencuje)
   - Pola `Date | null`: `@ApiPropertyOptional({ type: String, format: 'date-time', nullable: true })`
   - Wszystkie wymagane właściwości z `!` (definite assignment) — `id!: string`, nie `id: string`
   - Pola enum: `@ApiProperty({ enum: PrismaEnumType })`

2. W kontrolerze dodaj `@ApiResponse({ type: XxxResponseDto })` do **każdej** metody:

   ```ts
   @ApiResponse({ status: 200, type: ProviderResponseDto })
   getMyProvider() { ... }

   @ApiResponse({ status: 201, type: PricingTierResponseDto })
   create() { ... }

   @ApiResponse({ status: 200, type: [WorkingHoursResponseDto] })  // tablica
   listMine() { ... }
   ```

3. Dla paginowanych list utwórz dedykowany `XxxPageResponseDto`:
   ```ts
   export class ProviderPageResponseDto {
     @ApiProperty({ type: [ProviderResponseDto] }) data!: ProviderResponseDto[];
     @ApiProperty({ type: Number }) total!: number;
     @ApiProperty({ type: Number }) page!: number;
     @ApiProperty({ type: Number }) limit!: number;
   }
   ```

### 9.A.3. Obowiązki agenta FE (każda nowa strona / feature)

Po zmianach w BE lub przy starcie pracy z nowym modułem:

```bash
# 1. Upewnij się, że API działa lokalnie
pnpm --filter api dev

# 2. Wygeneruj typy
pnpm generate:api-client
# (odpowiednik: packages/api-client/node_modules/.bin/openapi-typescript
#   http://localhost:4000/v1/docs-json -o packages/api-client/src/schema.d.ts)
```

Typy w `api-data-access/*.ts` muszą być **aliasami schema**, nie ręcznymi definicjami:

```ts
// ✅ DOBRZE — alias do wygenerowanego schematu
export type Provider = components['schemas']['ProviderResponseDto'];
export type CreateProviderBody = components['schemas']['CreateProviderDto'];

// ❌ ŹLE — ręczna definicja = dryfuje przy każdej zmianie BE
export type Provider = {
  id: string;
  name: string;
  city: string; // pole które nie istnieje w Prisma!
};
```

### 9.A.4. Struktura `api-data-access/`

Katalog `apps/panel/api-data-access/` (i analogicznie `apps/mobile/api-data-access/`) grupuje wywołania API tak jak kontrolery w BE — jeden plik per kontroler:

```
apps/panel/api-data-access/
  auth.ts           ← /v1/auth/*
  providers.ts      ← /v1/providers/me
  pricing-tiers.ts  ← /v1/providers/me/pricing-tiers
  working-hours.ts  ← /v1/providers/me/working-hours
  bookings.ts       ← /v1/bookings (dodać w sprint 3)
  reviews.ts        ← /v1/reviews (dodać w sprint 5)
```

Każdy plik eksportuje:

- **typy żądań** — `export type XxxBody = components['schemas']['XxxDto']`
- **typy odpowiedzi** — `export type Xxx = components['schemas']['XxxResponseDto']`
- **funkcje** — `export function getXxx(): Promise<Xxx>`

Funkcje używają wewnętrznego `api` helperp (`apps/panel/lib/api.ts`) — nie bezpośrednio fetch ani axios.

### 9.A.5. Weryfikacja po każdym sprincie

Agent BE musi zweryfikować przed PR:

```bash
# Sprawdź czy wszystkie nowe endpointy mają response type w Swagger
curl -s http://localhost:4000/v1/docs-json | \
  jq '.paths | to_entries[] | select(.value[].responses["200"].content == null) | .key'
# Wynik powinien być pusty (lub zawierać tylko endpointy 204/logout)
```

Agent FE musi zweryfikować przed PR:

```bash
# TypeScript musi przechodzić bez błędów
cd apps/panel && npx tsc --noEmit
```

### 9.A.6. Pola Prisma `Decimal`

Pola Prisma typu `Decimal` (np. `priceSwapPln`, `avgRating`) w odpowiedzi JSON serializują się jako `number`. W DTO używaj `@ApiProperty({ type: Number })` — nie `Decimal`. We frontendzie typ to `number`.

---

## 9.B. Warstwa formularzy — wzorzec obowiązkowy

> **Zasada:** Każdy formularz w `apps/panel` musi mieć logikę wydzieloną do dedykowanego hooka. Strona/komponent zawiera wyłącznie JSX.

### Struktura

```
apps/panel/
  lib/
    schemas/          ← walidacja Zod (jeden plik na domenę)
      provider.schema.ts
      pricing.schema.ts
    hooks/            ← logika formularzy / stanu (jeden plik na domenę)
      use-provider-form.ts    ← React Hook Form + zodResolver
      use-pricing-tiers.ts   ← własny useState (lista/kolekcja)
      use-working-hours.ts   ← własny useState (lista/kolekcja)
      use-login-flow.ts      ← własny useState (state machine)
  app/
    dashboard/
      profile/page.tsx   ← tylko JSX, importuje useProviderForm()
      pricing/page.tsx   ← tylko JSX, importuje usePricingTiers()
      hours/page.tsx     ← tylko JSX, importuje useWorkingHours()
    login/page.tsx       ← tylko JSX, importuje useLoginFlow()
```

### Kiedy używać React Hook Form (RHF)

Formularz **jednej encji** (jeden obiekt → jeden endpoint PATCH/PUT):

```ts
// lib/schemas/provider.schema.ts
export const providerSchema = z.object({
  name: z.string().min(1, 'Wymagane'),
  email: z.string().refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Nieprawidłowy e-mail'),
});
export type ProviderFormValues = z.infer<typeof providerSchema>;

// lib/hooks/use-provider-form.ts
export function useProviderForm() {
  const form = useForm<ProviderFormValues>({ resolver: zodResolver(providerSchema), defaultValues: { ... } });
  const { reset } = form;
  useEffect(() => { getProvider().then((p) => { setProvider(p); reset(providerToValues(p)); }); }, [reset]);
  async function onSubmit(data: ProviderFormValues) { await updateProvider(data); reset(data); }
  return { form, onSubmit: form.handleSubmit(onSubmit), isDirty: form.formState.isDirty, ... };
}
```

**Reguły Zod dla pól opcjonalnych:** używaj `.refine()` zamiast `.optional().default('')` — unikasz rozbieżności input/output type z zodResolver.

### Kiedy używać własnego hooka (useState)

- Formularz zarządza **listą/kolekcją** (pricing tiers, working hours)
- Formularz jest **state machine** z wieloma krokami (login flow, multi-step wizard)
- Potrzeba **niestandardowej obsługi ref** (OTP grid z focus management)

```ts
// Przykład: use-login-flow.ts
export function useLoginFlow() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  // ... handlers
  return { step, otpRefs, handlePhoneSubmit, handleOtpSubmit, ... };
}
```

### Zasady obowiązkowe dla agentów

| ✅ TAK                                           | ❌ NIE                                                  |
| ------------------------------------------------ | ------------------------------------------------------- |
| Schemat Zod w `lib/schemas/`                     | Walidacja inline w komponencie                          |
| Hook w `lib/hooks/`                              | `useState` dla pól formularza bezpośrednio w `page.tsx` |
| Strona importuje jeden hook                      | Strona wywołuje API bezpośrednio                        |
| `form.reset(values)` po załadowaniu i po zapisie | Ręczne synchronizowanie `isDirty`                       |
| `zodResolver` dla formularzy pojedynczej encji   | `.optional().default('')` w schematach Zod              |

### Komponenty DS — zasada obowiązkowa

Wszystkie interaktywne elementy UI w `apps/panel` muszą pochodzić z `@opony/design-system-web`. Każda strona w pliku HTML designu (`design/b2b-*.html`, sekcja „DS Components") wskazuje jakich komponentów należy użyć.

```ts
import {
  Input,
  PhoneInput,
  OTPInput,
  Button,
  Toggle,
  Select,
  Textarea,
} from '@opony/design-system-web';
```

| ✅ TAK                                                        | ❌ NIE                                               |
| ------------------------------------------------------------- | ---------------------------------------------------- |
| `<Button variant="primary" loading={saving}>Zapisz</Button>`  | `<button className={styles.saveBtn}>Zapisz</button>` |
| `<Input label="Telefon" error={err} {...register('phone')}/>` | `<input className={styles.input} />`                 |
| `<Toggle checked={val} onChange={...} />`                     | `<button role="switch" className={styles.toggle}>`   |
| `<Select options={opts} value={v} onChange={...} />`          | `<select className={styles.select}>`                 |
| `<PhoneInput label="..." value={v} onChange={...} />`         | Własny div z flagą i `<input type="tel">`            |
| `<OTPInput length={6} value={code} onChange={setCode} />`     | Ręczna siatka 6× `<input maxLength={1}>`             |

DS `Input` i `Textarea` są `forwardRef` — działają bezpośrednio z RHF `{...register('field')}`.

**Jeśli jakiś komponent DS brakuje lub nie działa** → dodaj/popraw w `packages/design-system-web/src/`, nie omijaj przez natywny HTML.

### Ikony SVG — zasada obowiązkowa

Wszystkie ikony SVG używane w panelu muszą być zdefiniowane jako komponenty React w jednym pliku:

```
apps/panel/components/icons.tsx   ← jedyne miejsce definicji ikon
```

**Zasady:**

- Każda ikona to named export: `export function IconTrash(props: SVGProps<SVGSVGElement>) { ... }`
- Rozmiar (`width`/`height`) i `className` przekazuje konsument przez props — ikona nie ma hardcoded wymiarów
- `aria-hidden="true"` domyślnie w każdej ikonie (dekoracyjne)
- Inline SVG bezpośrednio w `.tsx` stronach/komponentach jest **zabronione**

| ✅ TAK                                                  | ❌ NIE                                                    |
| ------------------------------------------------------- | --------------------------------------------------------- |
| `import { IconTrash } from '../../../components/icons'` | `<svg viewBox="0 0 24 24">...</svg>` inline w page.tsx    |
| `<IconTrash width="13" height="13" />`                  | Lokalne `const Icon = () => <svg>...</svg>` w komponencie |
| Nowa ikona → dodaj do `components/icons.tsx`            | Kopiowanie ścieżek SVG między plikami                     |

---

## 9.C. Podział strony na komponenty — zasada obowiązkowa

> **Zasada:** Każda strona (`page.tsx`) musi być cienkim orchestratorem — importuje jeden hook i N komponentów. Żadnej logiki, żadnych helperów, żadnych inline SVG bezpośrednio w `page.tsx`.

### Struktura

```
app/dashboard/<modul>/
  page.tsx                  ← ~50 linii: import hook + import komponentów + return JSX
  <modul>.module.css
  _components/              ← Next.js: podkreślnik ukrywa folder przed routerem
    utils.ts                ← stałe i czyste funkcje (DAY_META, parseTime, rimLabel…)
    <ModulActionBar>.tsx    ← pasek akcji (save button, status chip)
    <MainSection>.tsx       ← główna sekcja formularza / lista
    <RowComponent>.tsx      ← wiersz listy (jeśli sekcja iteruje po kolekcji)
    <PreviewPanel>.tsx      ← podgląd dla klienta / aside
```

**Wzorce do naśladowania (zaimplementowane):**

| Strona               | `_components/`                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `pricing/page.tsx`   | PricingActionBar, TierList, TierRow, NewTierForm, PricingInfoNote, PricingPreview, utils.ts |
| `hours/page.tsx`     | HoursActionBar, DayList, DayRow, WeekTimeline, utils.ts                                     |
| `profile/page.tsx`   | ProfileActionBar, IdentitySection, ContactSection, LocationSection, ProfilePreview          |
| `dashboard/page.tsx` | StatusBanners, StatCard, ActionTile                                                         |
| `login/page.tsx`     | PhoneStep, OtpStep, LoginFooter, LoginHero                                                  |
| `register/page.tsx`  | StepsIndicator, FirmStep, ConfirmStep                                                       |

### Jak wygląda page.tsx po podziale

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMyFeature } from '../../../lib/hooks/use-my-feature';
import { useAuth } from '../../../lib/auth';
import { MyActionBar } from './_components/MyActionBar';
import { MySection } from './_components/MySection';
import { MyPreview } from './_components/MyPreview';
import styles from './my-feature.module.css';

export default function MyFeaturePage() {
  const router = useRouter();
  const { status } = useAuth();
  const { data, loading, saving, saved, update, save } = useMyFeature();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <MyActionBar saved={saved} saving={saving} onSave={save} />
      <div className={styles.content}>
        <MySection data={data} onUpdate={update} />
        <MyPreview data={data} />
      </div>
    </div>
  );
}
```

### Zasady obowiązkowe dla agentów

| ✅ TAK                                                     | ❌ NIE                                           |
| ---------------------------------------------------------- | ------------------------------------------------ |
| Komponenty specyficzne dla strony w `_components/`         | Cały JSX bezpośrednio w `page.tsx`               |
| Stałe i helpery w `_components/utils.ts`                   | `const DAY_META = ...` na górze `page.tsx`       |
| `page.tsx` ≤ ~80 linii                                     | `page.tsx` > 150 linii                           |
| Props zamiast bezpośredniego dostępu do hooka z komponentu | Komponent wywołuje `useMyFeature()` samodzielnie |
| Jeden hook na stronę (`use-my-feature.ts`) w `lib/hooks/`  | Logika bezpośrednio w `page.tsx`                 |

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

### 10.6. Płatności — NIE w POC v0 (ADR-003)

**Decyzja:** POC v0 bez wbudowanych płatności. Aplikacja darmowa w pilocie Nowego Sącza — brak prowizji, brak BLIK, brak P24 integration.

**Flow rezerwacji v0:**

```
Klient klika "Zarezerwuj termin" → POST /v1/bookings → Booking PENDING
     → provider dostaje SMS/push
     → provider akceptuje (CONFIRMED) lub odrzuca (REJECTED)
     → wizyta się odbywa
     → klient płaci providerowi offline (gotówka/przelew) — POZA PLATFORMĄ
     → provider klika "Zakończ" → Booking COMPLETED
     → klient może ocenić (US-16)
```

**Implikacje:**

- Zero kosztów per transakcja (brak fees P24).
- Zero compliance PCI-DSS / KNF (zwykły marketplace informacyjny).
- Brak cash flow z platformy (zamierzone w v0 — walidacja funnel + retention).
- Brak refund flow (anulowanie = klient nic nie traci).
- Ryzyko no-show wzrasta (klient nie ma skin-in-the-game) → mitigacja przez 2-strike anti-abuse policy.

**Monetyzacja w v0.5+ (ADR-003.1):**
Decyzję A (miesięczne fakturowanie) vs B (P24 marketplace split) podejmujemy po pilocie, na bazie danych z Nowego Sącza. Pole `bankAccountIban` w tabeli Provider zostaje jako opcjonalne — zbieramy na v0.5 bez wymuszania.

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

### ADR-001: Expo + React Native Web (klient) + Next.js portal (provider)

- **Status:** Accepted (rewizja ADR: zastąpiło „PWA zamiast React Native")
- **Kontekst:** MVP v0 ma walidować model biznesowy, ale potrzebujemy natywnych apek day-1 (engagement, push dla Kasi w v0.5) z minimalnym nakładem. Provider potrzebuje desktop-first ciężkiego admina (cennik, mapa strefy, finanse) — nie robi się tego na mobile.
- **Decyzja:**
  - **`apps/mobile`** — Expo SDK 50+ + React Native Web. Jeden codebase dla iOS, Android i Web PWA. v0 tylko feature'y klienta, v0.5+ dodaje feature'y providera (ekrany za guard `role=PROVIDER`).
  - **`apps/panel`** — osobny Next.js 14 pod `panel.opony.app` (desktop-first responsive). Tylko provider. Ciężki admin.
  - **`apps/landing`** — osobny Next.js 14 static pod `opony.app`. Tylko SEO/marketing.
  - **Design system** — 3 pakiety: `design-tokens` (JSON single source) + `design-system-native` (RN StyleSheet dla mobile) + `design-system-web` (CSS/Tailwind dla panel + landing).
- **Konsekwencje:**
  - (+) Natywne apki iOS/Android day-1 via Expo EAS build (nie trzeba migracji w v1).
  - (+) Web PWA na `app.opony.app` gratis z tego samego codebase'u (expo export:web).
  - (+) Provider v0.5/v1 dodawany w tej samej apce mobile — zero przepisywania, tylko nowe screens za role guard.
  - (+) Push notifications (Expo Notifications) dostępne od v0.5 — nie trzeba czekać na v1 rewrite.
  - (-) 2 flavors design-system (RN StyleSheet vs Web CSS) — mitigated przez shared `design-tokens` JSON.
  - (-) Osobny deploy dla panel (Vercel project #2) — ~5 min konfiguracji.
  - (-) Learning curve RN StyleSheet / Flexbox-only dla team'u znającego tylko React DOM (~1 tydz. ramp-up).
- **Bloker zewnętrzny:** Apple Developer Program ($199/rok) — verification 1–2 tyg. Musi wystartować w Fazie 0 (TASK-007b).
- **Design status (2026-04-22):** Wszystkie 3 artefakty mają pełne pokrycie w designie (38 ekranów, patrz [ADR-008](#adr-008-design-phase-closed--38-ekranów-3-artefakty-2026-04-22) i [plan-sprintow.md §12.Z](plan-sprintow.md#12z-pełny-zakres-design-phase--38-ekranów)).
- **Rewizja:**
  - v0.5 — provider dashboard dnia w mobile (W:12.5) + Expo Push dla PENDING
  - v1 — full provider flow w mobile (accept w terenie, GPS tracking, navigation to client)

### ADR-002: Przelewy24 zamiast Stripe ⚠️ SUPERSEDED przez ADR-004

- **Status:** SUPERSEDED (POC v0 bez płatności — patrz ADR-004)
- **Kontekst (historyczny):** Płatności online były planowane jako klucz modelu (prowizja 8%, BLIK dominuje w PL).
- **Decyzja (historyczna):** Przelewy24 jako primary payment provider.
- **Dlaczego SUPERSEDED:** W POC v0 rezygnujemy z wbudowanych płatności (aplikacja darmowa w pilocie). Decyzja P24 vs Stripe wraca w v0.5+ gdy włączamy monetyzację.

### ADR-004: POC v0 bez inline płatności (free pilot Nowy Sącz)

- **Status:** Accepted (2026-04)
- **Kontekst:** MVP v0 chce walidować _funnel i retention_ (czy klienci rezerwują, czy providerzy przyjmują), nie monetyzację. Inline płatności (P24) dodają 3-5 dni lead time (P24 verification), ~16 SP kodu (Payment module, webhooks, refund, settlement, cronsy), KNF/compliance overhead, i zamrażają decyzję prowizja A vs B przed zobaczeniem jak zachowuje się rynek.
- **Decyzja:** POC v0 **bez wbudowanych płatności**. Aplikacja darmowa w pilocie Nowy Sącz — klient rezerwuje online, płaci providerowi offline (gotówka/przelew) po wizycie. Zero prowizji w v0 (spójne z GTM §17.4 „0% pierwszym 8 providerom przez 3 mc"). Platforma to **zwykły marketplace informacyjny** — brak regulacji KNF/KIP.
- **Konsekwencje:**
  - (+) Eliminacja TASK-002 (P24 verification 3-5 dni lead time) — projekt startuje szybciej.
  - (+) -16 SP MUST (Sprint 3 BE-4 + FE-4 + Sprint 5 BE-6 settlement/refund) → timeline 7 tyg → 5-6 tyg.
  - (+) Brak compliance PCI-DSS, KNF, KIP.
  - (+) Provider nie wiąże się z P24 marketplace (mniej friction onboarding).
  - (+) Decyzję A (invoicing) vs B (P24 split) odkładamy do v0.5, gdy mamy dane z pilota.
  - (-) No-show rate wzrośnie (brak BLIK depozytu) — target <10% realistycznie 20-30% → mitigacja: 2-strike anti-abuse policy.
  - (-) UVP „Zarezerwuj i zapłać w 2 min" → „Zarezerwuj w 2 min, zapłać jak zawsze u wulkanizatora".
  - (-) Brak revenue signal w v0 — ale to jest zamierzone (walidacja non-financial).
- **Rewizja:** v0.5 po pilocie (8 providerów × 3 mc) — wybór A vs B na bazie danych. Tabela `Payment` i moduł wracają.

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

### ADR-009: B2B-first implementation sequencing (2026-04-22)

- **Status:** Accepted (2026-04-22) — zmienia kolejność sprintów z §7 plan-sprintow.md (wcześniej: klient + B2B równolegle).
- **Kontekst:** Pierwotny plan zakładał 7 sprintów z przeplataniem feature'ów klienta i providera (Sprint 1: klient auth **i** B2B wizard parallel; Sprint 2: klient search; Sprint 3: klient booking; Sprint 4: panel B2B; Sprint 5-7: polish). Dwie obserwacje wymuszają pivot:
  1. **Timing sezonu:** dziś 2026-04-22 — szczyt wiosennej wymiany (marzec-maj) już za nami. Następny peak = październik-listopad. Mamy ~5 miesięcy buforu, nie musimy ścigać się o launch w maju.
  2. **„Pusta apka" problem:** klient launched w tyg. 6 widzi 0 warsztatów, bo providerzy dopiero się wpinają w paralel. GTM §17.4 zakłada 8 pilotów × 3 mc zerowej prowizji — provider rekrutacja potrzebuje **działającego portalu w ręku rozmówcy**, nie 7 tygodni równoległej pracy w próżni.
- **Decyzja:** Implementacja MVP v0 w dwóch fazach:
  - **Faza A (Sprint 1-3, ~3 tygodnie) — B2B-first.** `panel.opony.app` LIVE z pełnym flow providera: auth OTP, onboarding wizard, cennik/godziny/strefa/profil, dashboard/kalendarz/lista rezerwacji, opinie, ustawienia. Retool admin setup od Sprint 1 (approve queue). Landing minimalny (provider-facing hero w Sprint 3). **Milestone A:** 8 pilotów onboarded z realnym cennikiem w DB, portal w rękach rozmówców.
  - **Faza B (Sprint 4-6, ~3 tygodnie) — klient.** `app.opony.app` LIVE z search + booking + ratings. Klient widzi **realne dane 8 providerów** od pierwszego uruchomienia, nie seed data. Landing pivot na client-facing, dodanie `/p/<slug>` + `/nowy-sacz`. **Milestone B:** full marketplace.
  - **Sprint 7:** soft launch + beta → public launch przed jesiennym szczytem (październik).
- **Konsekwencje:**
  - (+) **Zero „pustej apki"** — klient widzi realne 8 warsztatów od dnia 1 w Sprint 6.
  - (+) **Provider rekrutacja w paralel z Fazą A** — GTM zaczyna rozmowy w tyg. 3 z działającym portalem, nie w tyg. 7 z mockupami.
  - (+) **Seed effect organiczny** — providerzy mówią swoim klientom „od czerwca rezerwujecie online", tworząc demand pre-launch.
  - (+) **Cleaner dependency graph w BE** — Provider → Booking → Review zamiast równoległych gałęzi. Booking entity w Sprint 3 z manual-booking po stronie providera, klient POST /bookings w Sprint 5 na gotowym schemacie.
  - (+) **Retool burn-in od tyg. 1** — admin używa Retool natychmiast do approve, nie „znajdzie się w Sprint 6".
  - (-) Faza A prowadzi cichy okres dla providera (tyg. 3-6 — portal jest, klientów brak) → mitigacja: nowy ekran [b2b-15-waiting-for-clients](../design/b2b-15-waiting-for-clients.html) (analog `16-empty-waitlist`) + communication plan w `analiza-biznesowa.md §17` (weekly update „klienci startują za X dni").
  - (-) Wymaga TASK-013 (konto Retool) w Fazie 0 jako blokera Sprint 1, nie Fazie 6 jak było.
  - (-) Landing musi mieć 2 wersje: provider-facing v1 (Sprint 3), client-facing v2 (Sprint 6). Hero pivot + dopisanie `landing-02`/`landing-03`.
- **Timeline (zaktualizowany):**
  - Sprint 0 (scaffold) — bez zmian.
  - **Sprint 1:** Provider auth + wizard + Retool admin. BE-1 (schema), BE-2 (Provider CRUD), FE-panel-1 (login+wizard).
  - **Sprint 2:** Provider profile config. BE-3 (Pricing, Schedule, ServiceArea), FE-panel-2 (cennik/godziny/strefa/profil/ustawienia).
  - **Sprint 3:** Provider daily ops + Booking entity. BE-4 (Booking + manual), FE-panel-3 (dashboard/kalendarz/lista/szczegół/opinie/waiting-for-clients). Landing provider-facing v1. **★ Milestone A.**
  - **Sprint 4:** Klient auth + catalog. BE-5 (Client auth, listing), FE-mobile-1 (auth+profil+pojazd), FE-mobile-2 (home+detail+map+empty states).
  - **Sprint 5:** Klient booking flow. BE-6 (POST /bookings, availability), FE-mobile-3 (time-slot+confirmation+list+detail), provider PENDING accept (kontrakt z Sprint 3).
  - **Sprint 6:** Ratings + polish. BE-7 (Reviews + cron), FE-mobile-4 (rate+reviews), FE-mobile-5 (offline/PWA/error), landing client-facing pivot. **★ Milestone B.**
  - Sprint 7 (soft launch) — bez zmian.
- **Rewizja:** Po Milestone A (tyg. 4) — decyzja czy przechodzimy do Fazy B, czy iterujemy Fazę A jeszcze tydzień (feedback od 8 pilotów może zmienić priorytety).

### ADR-008: Design phase closed — 38 ekranów, 3 artefakty (2026-04-22)

- **Status:** Accepted (2026-04-22)
- **Kontekst:** Przed implementacją potrzebujemy kompletnego visual-language (tokens + componenty) i konkretnych ekranów, żeby FE-mobile / FE-panel / FE-landing mogli pracować równolegle bez koordynacyjnego chaosu. Pierwotnie planowany „Figma 10 ekranów" w Fazie 1 (patrz §7 plan-sprintów) został rozszerzony do pełnego pokrycia MVP v0 w formie statycznych HTML/CSS mockupów.
- **Decyzja:** Design phase zamknięty **2026-04-22** z **38 ekranami HTML** w folderze `/design`. Industrial-dark aesthetic: graphite `#0A0B0E` + amber `#FF6B1A`, typografia Bebas Neue (display) + Archivo (body) + JetBrains Mono (prices/codes). Pokrycie per artefakt ADR-001:
  - **A. Klient mobile** (`app.opony.app`, Expo RNW) — 21 ekranów (phone 393×852). Auth flow, booking flow, profil + pojazdy, ratings, onboarding post-OTP, 3 warianty empty-state (US-40), offline, PWA install prompt, error boundary.
  - **B. Panel B2B** (`panel.opony.app`, Next.js) — 14 ekranów (desktop 1440×900). Login SMS OTP, onboarding 3-step, daily ops (dashboard, kalendarz, szczegół rezerwacji, opinie, lista), firma (cennik/godziny/strefa/profil), ustawienia konta.
  - **C. Landing** (`opony.app`, Next.js Static) — 3 ekrany. Home marketing, publiczny profil warsztatu (SSR + OG + share, US-42), miasto-listing (SEO long-tail).
- **Reguły architekturalne (utrwalone w tej fazie):**
  1. **Zero booking-flow w landing i panel** — żadnych kalendarzy, slot-pickerów ani formularzy rezerwacji w przeglądarce. Wszystkie rezerwacje odbywają się wyłącznie w `app.opony.app`. Landing zawiera CTA „Otwórz w aplikacji" (Universal Links + QR dla desktop), panel ma „Rezerwacja ręczna" (b2b-13) dla wizyt zgłaszanych telefonicznie — jedyny wyjątek.
  2. **Miasto pilotażowe = Nowy Sącz** (nie Poznań jak w oryginalnych założeniach) — wszystkie designy, SEO routes i copy referują do NS.
  3. **Zero płatności w v0** (spójne z ADR-004) — ekran „14-payment" nie powstał, step indicator booking flow to 2/2 („Adres → Termin → Potwierdź"), a ekran potwierdzenia pokazuje „płatność u providera" zamiast „BLIK ✅".
- **Konsekwencje:**
  - (+) FE-mobile / FE-panel / FE-landing mogą pracować równolegle — gotowe mockupy + states per ekran eliminują ambiguity w dev-handoff.
  - (+) Tokens design-system (kolory, typografia, spacing) ekstraktowalne z HTML do JSON source-of-truth → `@opony/design-tokens` (patrz §7 Design System).
  - (+) Edge cases pokryte w designie (offline, error boundary, PWA install, 3 warianty empty-state US-40) — rzadziej wracamy do design-phase w trakcie sprintów.
  - (-) Mockupy w HTML/CSS (nie Figma) — ograniczona współpraca z designerem-samotnikiem; v1 rozważyć migrację do Figma dla reviews + prototypów.
- **Dev-handoff:** Pełna mapa ekran ↔ wireframe ↔ user-story w [`plan-sprintow.md §12.Z`](plan-sprintow.md#12z-pełny-zakres-design-phase--38-ekranów). Każdy ekran ma footer `<caption>` z enumeracją stanów, edge cases i decyzji a11y — to jest kontrakt dla developerów.

---

## 12. Ewolucja: MVP v0 → v1

MVP v0 validuje model biznesowy w Nowym Saczu. Po spełnieniu kryteriow sukcesu, architektura ewoluuje:

**Kryteria przejścia do v1:**

- \> 100 rezerwacji/mc w Nowym Saczu (~25/tydzien).
- \> 12 aktywnych providerów (MAU >= 1 rez/mc).
- NPS klientow > 30, < 15% no-show.
- TTFB < 7 dni dla nowych providerów.

**Planowane zmiany v1:**

| Obszar            | MVP v0                        | MVP v1                                                                                                |
| ----------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------- |
| Platforma klienta | Expo + RNW (mobile + web, v0) | Natywne apki published na App Store / Google Play (v1) + provider features w tej samej apce (v0.5/v1) |
| Typ providera     | Tylko mobilny                 | + Stacjonarny (warsztaty)                                                                             |
| Zasięg            | 1 miasto (Nowy Sacz)          | 3+ miast                                                                                              |
| Strefa obsługi    | Promien (haversine)           | Polygon (PostGIS)                                                                                     |
| Cache             | Brak                          | Redis (sloty, sessions)                                                                               |
| Płatności         | — (offline, brak inline)      | v0.5: P24 (BLIK + karty + marketplace split lub invoicing NET 14) · v1: + Stripe fallback             |
| Sloty real-time   | Polling 30s                   | WebSocket / SSE                                                                                       |
| Powiadomienia     | SMS + email                   | + Expo Notifications (native push) — możliwe już w v0.5                                               |
| Mapy              | Google Maps                   | + Mapbox (tańsze per load)                                                                            |
| Admin             | Retool Cloud                  | Własny Next.js admin panel                                                                            |
| Profil pojazdu    | Reczne wpisanie               | Auto-fill z VIN (CEPIK API)                                                                           |
| Trasy mobilne     | Reczna kolejnosc              | Mapbox Optimization API (VRP)                                                                         |
