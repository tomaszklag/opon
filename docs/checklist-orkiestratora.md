# Checklist Orkiestratora — szczegółowe taski

> Każdy task to JEDNO konkretne działanie. Opis mówi CO zrobić, JAK i jaki jest OCZEKIWANY REZULTAT. Rób po kolei od góry.

---

## ✅ Design phase: ZAMKNIĘTA (2026-04-22)

**38 ekranów HTML w `/design`** — industrial-dark, Bebas Neue + Archivo + JetBrains Mono, graphite #0A0B0E + amber #FF6B1A. Pełna mapa ekran ↔ wireframe ↔ user-story w [`plan-sprintow.md §12.Z`](../docs/plan-sprintow.md#12z-pełny-zakres-design-phase--38-ekranów). Rationale + reguły architekturalne w [ADR-008](../docs/architektura.md#adr-008-design-phase-closed--38-ekranów-3-artefakty-2026-04-22).

**Przed startem Sprint 0:** zespół FE (3 agentów — FE-mobile / FE-panel / FE-landing) powinien przejrzeć swój zakres ekranów (TASK-020b). Design to source of truth — nie wymyślamy UX od nowa podczas implementacji.

---

# FAZA 0: Przygotowanie (przed kodowaniem)

## 0.1. Konta zewnętrzne — długi lead time (zacznij natychmiast!)

### TASK-001: Kup domenę

- **Co:** Kup domenę `opony.app` (lub alternatywę np. `opony.pl`, `oponyapp.pl`)
- **Jak:** Rejestracja u rejestratora (OVH, Cloudflare, nazwa.pl). Wybierz z DNS management.
- **Czas:** 10 min
- **Rezultat:** Domena aktywna, dostęp do panelu DNS
- [ ] Zrobione

### TASK-002: ~~Załóż konto Przelewy24~~ — USUNIĘTE (ADR-004)

**Zadanie usunięte** — POC v0 bez płatności, aplikacja darmowa w pilocie. Oszczędność lead time 3–5 dni roboczych (weryfikacja P24).

Wróci w v0.5 po pilocie, gdy włączamy monetyzację (decyzja P24 marketplace vs miesięczne fakturowanie).

### TASK-003: Załóż konto Twilio + Sender ID

- **Co:** Konto Twilio + weryfikacja biznesowa + rejestracja alfanumerycznego Sender ID „OPONY" w PL.
- **Jak:** (1) Rejestracja na twilio.com → (2) Business verification (wymaga dokumentów firmy) → (3) W panelu: Messaging → Senders → Alphanumeric Sender ID → rejestracja „OPONY" dla Polski.
- **Czas:** 30 min na setup, **1–2 tygodnie** na Sender ID (operator PL weryfikuje)
- **Rezultat:** `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE` (lub Sender ID `OPONY`)
- **Fallback:** Do czasu akceptacji Sender ID używaj zakupionego numeru PL (+48...)
- [ ] Konto założone
- [ ] Business verification przeszła
- [ ] Sender ID „OPONY" wysłany do rejestracji
- [ ] Credentials zapisane

### TASK-004: Załóż konto AWS + bucket S3

- **Co:** Konto AWS, bucket S3 do przechowywania zdjęć providerów.
- **Jak:** (1) Rejestracja AWS → (2) S3 → Create bucket `opony-uploads` → Region `eu-central-1` → Block all public access ON → (3) IAM → Create user `opony-s3-uploader` → Attach policy `AmazonS3FullAccess` (zawęż w produkcji!) → (4) Wygeneruj Access Key.
- **Czas:** 20 min
- **Rezultat:** `AWS_S3_BUCKET=opony-uploads`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION=eu-central-1`
- [ ] Bucket stworzony
- [ ] IAM user + access key

### TASK-005: Załóż konto GitHub + repo

- **Co:** Repo `opony` (private) na GitHub.
- **Jak:** GitHub → New repository → Name: `opony` → Private → bez README (dodamy z kodu) → Create.
- **Czas:** 5 min
- **Rezultat:** URL repo `github.com/<user>/opony`
- [ ] Repo istnieje

### TASK-006: Załóż konto Railway

- **Co:** Hosting dla NestJS API + PostgreSQL.
- **Jak:** Railway.app → Sign up with GitHub → New project → dodaj Postgres 16 database. Podepnij kartę (free trial $5 credit).
- **Czas:** 10 min
- **Rezultat:** `DATABASE_URL` z Railway dashboard (PostgreSQL connection string)
- [ ] Konto aktywne
- [ ] Postgres database stworzony
- [ ] `DATABASE_URL` skopiowany

### TASK-007: Załóż konto Vercel

- **Co:** Hosting dla 3 aplikacji: `apps/mobile` (Expo RNW web export), `apps/panel` (Next.js), `apps/landing` (Next.js).
- **Jak:** Vercel.com → Sign up with GitHub → Import project `opony` (po push kodu w Sprint 0). Na razie tylko konto.
- **Czas:** 5 min
- **Rezultat:** Konto Vercel połączone z GitHub
- [ ] Konto aktywne

### TASK-007b: Załóż konto Expo EAS + Apple Developer Program + Google Play Console ⚠️ **BLOKER — lead time 1–2 tyg.**

- **Co:** Konta pod natywne buildy iOS/Android (v0.5/v1 publishing do App Store + Google Play). **Apple Developer Program ma verification 1–2 tyg.** → musi startować w Fazie 0, razem z TASK-003 Twilio (TASK-002 P24 usunięty — ADR-004).
- **Jak:**
  1. **Expo / EAS** — expo.dev → Sign up → Install `eas-cli` globally → `eas login` w repo (po Sprint 0). Free tier = 30 buildów/mc.
  2. **Apple Developer Program** — developer.apple.com/programs → Enroll (Apple ID + dowód osobisty dla indywidualnego / D-U-N-S + dokumenty firmowe dla JDG/Sp. z o.o.) → **$99/rok**. Verification: 24–48h (indywidualne) / 1–2 tyg. (firmowe).
  3. **Google Play Console** — play.google.com/console → Sign up → **$25 one-time**. Verification ~1 dzień.
  4. **App Store Connect** (po Apple Dev approval) — utwórz app record z bundle ID `app.opony.mobile`.
  5. **Google Play Console** — utwórz app record z package `app.opony.mobile`.
- **Czas:** 30 min pracy + **1–2 tyg. Apple verification**
- **Koszt setup:** $99 (Apple) + $25 (Google) = ~500 PLN. Expo EAS free w v0.
- **Rezultat:** konta gotowe do pierwszego `eas build --platform ios/android`
- [ ] Expo / EAS konto
- [ ] Apple Developer Program verified (BLOCKER iOS build)
- [ ] Google Play Console verified
- [ ] Bundle ID / package name zarezerwowane

### TASK-008: Załóż konto Resend + weryfikacja domeny

- **Co:** Serwis email transakcyjny (potwierdzenia, reset, raporty).
- **Jak:** (1) Resend.com → Sign up → (2) Settings → Domains → Add domain `opony.app` → (3) Dodaj 3 rekordy DNS (SPF, DKIM, DMARC) w panelu rejestratora domeny → (4) Kliknij „Verify" w Resend.
- **Czas:** 15 min + czekanie na propagację DNS (do 24h, zwykle 10 min)
- **Rezultat:** `RESEND_API_KEY`, domena zweryfikowana (status: Verified)
- [ ] Konto założone
- [ ] Rekordy DNS dodane
- [ ] Domena zweryfikowana

### TASK-009: Załóż konto Sentry + 4 projekty

- **Co:** Monitoring błędów dla API, mobile app (Expo native + web), panel, landing.
- **Jak:** Sentry.io → Sign up → Create organization `opony` → Create 4 projects: (1) `opony-api` platform Node.js (2) `opony-mobile` platform React Native (obsługuje też web export via `@sentry/react-native` + `@sentry/browser`) (3) `opony-panel` platform Next.js (4) `opony-landing` platform Next.js.
- **Czas:** 10 min
- **Rezultat:** 4 × `SENTRY_DSN` (jeden per projekt)
- [ ] 4 projekty stworzone
- [ ] DSN-y zapisane

### TASK-010: Załóż konto Google Cloud + włącz Maps APIs

- **Co:** Google Maps JS API, Geocoding API, Places API.
- **Jak:** (1) console.cloud.google.com → New project `opony` → (2) APIs & Services → Enable: Maps JavaScript API, Geocoding API, Places API → (3) Credentials → Create API Key → restrict: HTTP referrers `*.opony.app`, APIs only enabled → (4) Billing → Budgets & alerts → Create budget $50/mc.
- **Czas:** 15 min
- **Rezultat:** `GOOGLE_MAPS_API_KEY`, billing cap $50/mc ustawiony
- **⚠** Stwórz 2 klucze: jeden server-side (bez restrictions, dla geocoding w API), jeden client-side (restricted, `NEXT_PUBLIC_GOOGLE_MAPS_KEY`)
- [ ] Projekt stworzony
- [ ] 3 API włączone
- [ ] 2 klucze API wygenerowane
- [ ] Billing cap $50/mc

### TASK-011: Zarejestruj klucz GUS BIR

- **Co:** Klucz API do weryfikacji NIP providerów.
- **Jak:** Wyszukaj "GUS BIR API klucz" → formularz rejestracyjny na stronie GUS → wypełnij dane → klucz przychodzi emailem.
- **Czas:** 10 min + oczekiwanie (zwykle ten sam dzień)
- **Rezultat:** `GUS_API_KEY`
- [ ] Formularz wysłany
- [ ] Klucz otrzymany

### TASK-012: Załóż konto PostHog

- **Co:** Analytics produktowe (funnele, konwersja).
- **Jak:** PostHog.com → Sign up (free tier: 1M events/mc) → Get API key.
- **Czas:** 5 min
- **Rezultat:** `NEXT_PUBLIC_POSTHOG_KEY`
- [ ] Konto aktywne

### TASK-013: Załóż konto Retool Cloud

- **Co:** Panel admina (approve/reject providerów, moderacja).
- **Jak:** Retool.com → Sign up → Team plan (free trial).
- **Czas:** 5 min
- **Rezultat:** Konto Retool gotowe (konfiguracja dashboardów w Sprint 6)
- [ ] Konto aktywne

---

## 0.2. Środowisko lokalne

### TASK-014: Zainstaluj Node.js 20+

- **Co:** Runtime dla backendu i frontendu.
- **Jak:** Pobierz z nodejs.org (LTS) lub `nvm install 20`. Sprawdź: `node -v` → `v20.x.x`.
- **Rezultat:** `node -v` zwraca 20+
- [ ] Zainstalowany

### TASK-015: Zainstaluj pnpm 9+

- **Co:** Menedżer pakietów dla monorepo.
- **Jak:** `npm install -g pnpm` lub `corepack enable && corepack prepare pnpm@latest --activate`. Sprawdź: `pnpm -v`.
- **Rezultat:** `pnpm -v` zwraca 9+
- [ ] Zainstalowany

### TASK-016: Zainstaluj Docker Desktop

- **Co:** Konteneryzacja — Postgres i mailpit w dev.
- **Jak:** Pobierz z docker.com. Uruchom. Sprawdź: `docker compose version`.
- **Rezultat:** Docker Desktop running, `docker compose` działa
- [ ] Zainstalowany i uruchomiony

### TASK-017: Skonfiguruj VS Code

- **Co:** Edytor z rozszerzeniami.
- **Jak:** Zainstaluj extensions: ESLint, Prettier, Prisma, Tailwind CSS IntelliSense (opcjonalnie). Ustaw: Format on Save = true.
- **Rezultat:** VS Code z auto-formatowaniem
- [ ] Extensions zainstalowane

---

## 0.3. Przeczytaj dokumentację

### TASK-018: Przeczytaj index (analiza.md)

- **Co:** Orientacja w dokumentacji — co gdzie jest.
- **Jak:** Otwórz `analiza.md` → przeczytaj tabelę dokumentów + kluczowe metryki.
- **Czas:** 5 min
- [ ] Przeczytane

### TASK-019: Przeczytaj architekturę (sekcje 1–6)

- **Co:** Zrozum stack, deployment, setup, moduły NestJS, auth flow.
- **Jak:** Otwórz `docs/architektura.md` → czytaj sekcje 1 (stack), 2 (diagramy), 3 (monorepo), 4 (setup guide), 5 (NestJS), 6 (auth).
- **Czas:** 30 min
- **Cel:** Po przeczytaniu wiesz: co hostujemy gdzie, jak wygląda auth, jakie moduły ma backend.
- [ ] Przeczytane

### TASK-020: Przeczytaj plan sprintów (sekcja 20)

- **Co:** Zrozum jak wyglądają prompty dla agentów — to ich „briefy".
- **Jak:** Otwórz `docs/plan-sprintow.md` → przewiń do sekcji 20 → przejrzyj Sprint 0 i Sprint 1 (resztę przeczytasz przed każdym sprintem).
- **Czas:** 20 min
- [ ] Przeczytane

### TASK-021: Przeczytaj plan agentów

- **Co:** Zrozum role: Architekt, Projektant, Developer, Tester + jak współpracują.
- **Jak:** Otwórz `docs/plan-agentow.md` → przeczytaj całość.
- **Czas:** 10 min
- [ ] Przeczytane

### TASK-021b: Przejrzyj design (38 ekranów HTML) ⭐

- **Co:** Design phase zamknięty (2026-04-22). Przed startem sprintów zobacz jak wygląda cała apka.
- **Jak:**
  1. Otwórz [`plan-sprintow.md §12.Z`](../docs/plan-sprintow.md#12z-pełny-zakres-design-phase--38-ekranów) — tabela mapuje każdy plik `.html` do wireframe i user-story.
  2. Otwórz w przeglądarce minimum po 2 ekrany z każdego artefaktu:
     - **Klient mobile** — `design/01-home.html`, `design/03-time-slot.html`, `design/07-profile.html` _(typowy booking flow)_
     - **Panel B2B** — `design/b2b-01-dashboard.html`, `design/b2b-08-szczegol-rezerwacji.html` _(daily ops providera)_
     - **Landing** — `design/landing-01-home.html`, `design/landing-02-profil-publiczny.html` _(marketing + share)_
  3. Zwróć uwagę na footer `<caption>` pod każdym ekranem — opisuje stany, edge cases i decyzje a11y. **To jest kontrakt dla FE.**
  4. Zapoznaj się z regułami architekturalnymi z [ADR-008](../docs/architektura.md#adr-008-design-phase-closed--38-ekranów-3-artefakty-2026-04-22):
     - Zero booking-flow w landing/panel (wszystkie rezerwacje w app.opony.app)
     - Miasto pilot = Nowy Sącz (nie Poznań)
     - Zero płatności w v0 (ADR-004)
- **Czas:** 30–40 min
- [ ] Przeglądnięte minimum 6 ekranów (po 2 na artefakt)
- [ ] Zapoznane z §12.Z (tabela ekran↔US)
- [ ] Zapoznane z ADR-008 (reguły architekturalne)

---

## 0.4. Przygotuj plik z credentials

### TASK-022: Stwórz lokalny plik z wszystkimi credentials

- **Co:** Zbierz wszystkie klucze API z TASKów 002–013 w jedno bezpieczne miejsce.
- **Jak:** Stwórz plik `credentials-local.md` (NIE commituj do repo!) lub użyj password managera. Zapisz:
  ```
  # P24_* — USUNIĘTE w v0 (ADR-004), wróci w v0.5
  TWILIO_SID=...
  TWILIO_AUTH_TOKEN=...
  AWS_ACCESS_KEY_ID=...
  AWS_SECRET_ACCESS_KEY=...
  RESEND_API_KEY=...
  SENTRY_DSN_API=...
  SENTRY_DSN_CLIENT=...
  SENTRY_DSN_PROVIDER=...
  GOOGLE_MAPS_API_KEY=...
  GOOGLE_MAPS_CLIENT_KEY=...
  GUS_API_KEY=...
  POSTHOG_KEY=...
  DATABASE_URL=... (z Railway)
  ```
- **Rezultat:** Jedno miejsce ze wszystkimi credentials, gotowe do wklejenia w `.env.local`
- [ ] Credentials zebrane

---

# FAZA 1: Sprint 0 — Scaffold (dzień 1–2)

### TASK-023: Uruchom Agent INFRA-REPO

- **Co:** Scaffold monorepo (Turborepo, Docker, CI/CD).
- **Jak:** Otwórz Claude Code w pustym katalogu projektu. Wklej prompt z `plan-sprintow.md` sekcja 20, Sprint 0, Agent INFRA-REPO. Dodaj na początku: _"Pracujesz w pustym katalogu. Stwórz projekt od zera."_
- **Czas:** 15–30 min pracy agenta
- **Rezultat:** Repo z 4 apkami, `pnpm dev` startuje, CI green
- **Weryfikacja:** `pnpm dev` → otwórz `http://localhost:4000/v1/health` → `{"status":"ok"}`
- [ ] Agent uruchomiony
- [ ] Rezultat zweryfikowany

### TASK-024: Pierwszy push do GitHub

- **Co:** Wypchnij scaffold do repo.
- **Jak:** `git init && git remote add origin <url> && git add -A && git commit -m "Sprint 0: scaffold" && git push -u origin main`
- **Rezultat:** Kod na GitHub, CI pipeline triggered
- [ ] Push zrobiony
- [ ] CI green

### TASK-025: Uruchom Agent INFRA-DX

- **Co:** Swagger, OpenAPI client, MSW infra, Sentry.
- **Jak:** W tym samym repo. Wklej prompt INFRA-DX z sekcji 20. Dodaj: _"Repo już istnieje z scaffoldu INFRA-REPO. Rozbuduj go."_
- **Czas:** 10–20 min
- **Rezultat:** `/v1/docs` Swagger, MSW setup w FE apkach, Sentry SDK
- **Weryfikacja:** Otwórz `http://localhost:4000/v1/docs` → Swagger UI widoczny
- [ ] Agent uruchomiony
- [ ] Swagger działa

### TASK-026: Uruchom Agent DS-0 (Design System)

- **Co:** Ekstrakcja tokenów z HTML mockupów + 10 base komponentów + Storybook.
- **Source of truth (MUST):** `/design/*.html` — wszystkie tokeny w `:root { --bg, --accent, --font-display ... }` pierwszego-lepszego pliku (np. `design/01-home.html` lines 17–47). Industrial-dark: graphite `#0A0B0E` + amber `#FF6B1A`, Bebas Neue / Archivo / JetBrains Mono. Agent DS-0 **nie wymyśla** tokenów — wyciąga z `:root` do `packages/design-tokens/tokens.json` i generuje 3 flavors (RN StyleSheet + CSS vars + Tailwind config) per ADR-001.
- **Jak:** Wklej prompt DS-0 z załącznikiem ścieżek `/design/01-home.html` (mobile tokens) + `/design/b2b-01-dashboard.html` (desktop tokens — identyczne `:root`, różnią się tylko scale). Może pracować równolegle z INFRA-DX (oddzielny branch!).
- **Czas:** 20–30 min
- **Rezultat:** `/packages/design-tokens/` + `/packages/design-system-native/` + `/packages/design-system-web/` z 10 komponentami, Storybook
- **Weryfikacja:**
  - `pnpm storybook` → otwórz browser → 10 komponentów widocznych
  - Porównaj wizualnie z `/design/01-home.html` — card, chip, slot-pill, CTA muszą mieć ten sam look (kolory, fonty, radius, padding)
- [ ] Agent uruchomiony
- [ ] Tokens wyciągnięte z `/design/01-home.html :root` do `tokens.json`
- [ ] Storybook działa, komponenty pasują do mockupów

### TASK-027: Uzupełnij .env.local z credentials

- **Co:** Wklej prawdziwe credentials do `.env.local` (z TASK-022).
- **Jak:** `cp .env.example .env.local` → otwórz → wklej wartości z TASK-022. Na razie placeholder'y dla Twilio (jeśli weryfikacja trwa) — `NEXT_PUBLIC_API_MOCK=true` pozwoli FE pracować bez nich.
- **Rezultat:** `.env.local` z prawdziwymi lub placeholder credentials
- [ ] Wypełnione

### TASK-028: Merge + weryfikacja Sprint 0

- **Co:** Merge branchy INFRA-DX + DS-0 do main.
- **Jak:** (1) Merge INFRA-DX → main (2) Merge DS-0 → main (rebase jeśli conflict) (3) Uruchom checklistę:
- **Checklista Sprint 0:**
  - [ ] `pnpm dev` — 4 apki startują
  - [ ] `http://localhost:4000/v1/health` — OK
  - [ ] `http://localhost:4000/v1/docs` — Swagger
  - [ ] `pnpm storybook` — 10 komponentów
  - [ ] `.env.example` — 22+ zmienne
  - [ ] `docker compose up -d` — Postgres + mailpit
  - [ ] `git push origin main` → CI green

---

# FAZA 2: Sprint 1 — Provider auth + onboarding wizard + Retool admin (tydzień 1)

> **ADR-009 B2B-first:** Sprint 1-3 to Faza A (provider portal LIVE → Milestone A). Klient pojawi się w Sprint 4. Nie uruchamiaj jeszcze agentów FE-mobile.

### TASK-029: Uruchom Agent BE-1a (Schema Owner)

- **Co:** Stworzenie PEŁNEGO schematu Prisma (14 tabel) + seed data.
- **Jak:** Branch `sprint-1/be-1a-schema`. Wklej prompt BE-1a z `plan-sprintow.md §20`. Dodaj kontekst: _"Repo istnieje ze scaffoldu Sprint 0. Pracujesz w /apps/api. Stwórz schemat Prisma ze WSZYSTKIMI tabelami zgodnie z architektura.md §8."_
- **Seed:** 1 admin (role=ADMIN) + 2 providerów PENDING_APPROVAL (do testu approve flow). Reszta seed rozbuduje się w kolejnych sprintach.
- **Czas:** 20–30 min
- **Weryfikacja:** `pnpm db:migrate` → 14+ tabel. `pnpm db:seed` → dane w DB. `npx prisma studio` → przeglądaj.
- **⚠ KRYTYCZNE:** To fundament. Uruchom Architekta na review ZANIM merge'ujesz!
- [ ] Agent uruchomiony
- [ ] Migracja działa
- [ ] Seed dane widoczne w Prisma Studio

### TASK-030: Architekt — review schematu BE-1a

- **Co:** Code review schematu Prisma — najważniejszy review w projekcie.
- **Jak:** Prompt: _"Zrób review PR sprint-1/be-1a-schema. Sprawdź schema.prisma i seed.ts. Referencja: architektura.md §8. Sprawdź: wszystkie tabele, typy, FK, unique constraints (partial index!), enumy, indeksy."_
- [ ] Review zrobiony
- [ ] Schema approved

### TASK-031: Merge BE-1a do main

- **Co:** Schema owner merge'uje PIERWSZY — reszta agentów na niego czeka.
- **Jak:** `git checkout main && git merge sprint-1/be-1a-schema && git push`
- [ ] Merge zrobiony

### TASK-032: Uruchom Agent BE-1b (Shared auth + Provider onboarding + GUS)

- **Co:** Auth SMS OTP (shared dla CLIENT i PROVIDER_OWNER) + provider signup + GUS + S3 UploadService.
- **Jak:** Branch `sprint-1/be-1b-auth-provider`. Wklej prompt BE-1b z §20 nowego planu. Dodaj: _"Schema Prisma gotowa (merge BE-1a). Client-side endpoints (GET/PATCH /v1/me, /vehicles) — pominięte w Sprint 1, wracają w Sprint 4."_
- **Czas:** 45–60 min
- **Weryfikacja:** Swagger → `POST /v1/auth/otp/request` → SMS → `/verify` → JWT. `POST /v1/provider/signup` → NIP verify (mock GUS) → upload zdjęć S3 → PENDING_APPROVAL.
- [ ] OTP flow działa
- [ ] Provider signup → PENDING_APPROVAL
- [ ] S3 upload działa

### TASK-033: Uruchom Agent FE-panel-1 (Login + onboarding wizard 3-step)

- **Co:** Provider login (b2b-12) + wizard 3 kroki (b2b-02, b2b-03, b2b-04).
- **Jak:** Branch `sprint-1/fe-panel-1-auth-wizard`. Wklej prompt FE-panel-1. Agent startuje z MSW — NIE czeka na BE.
- **Czas:** 60–90 min
- **Design reference:** `/design/b2b-12-login.html`, `b2b-02-onboarding-firma.html`, `b2b-03-onboarding-zdjecia.html`, `b2b-04-onboarding-weryfikacja.html`
- **Weryfikacja:** `http://localhost:3001` → signup → NIP auto-fill → upload 3 zdjęć → pending screen. Pixel-match z mockupami.
- [ ] Agent uruchomiony
- [ ] Flow działa z MSW (signup → pending)
- [ ] Login OTP działa

### TASK-034: Skonfiguruj Retool — admin approve queue (HUMAN TASK — Ty!) ⚠ KRYTYCZNE

- **Co:** Provider approval queue w Retool (wcześniej było w Sprint 6 — ADR-009 przesuwa na Sprint 1, admin approve potrzebny od razu).
- **Dlaczego teraz:** Bez Retoola nikt nie może zatwierdzić providerów → blokada Sprint 3 Milestone A (onboard 8 pilotów).
- **Jak:**
  1. Zaloguj się do Retool (TASK-013).
  2. Połączenie: Postgres read + REST API write (użyj admin JWT z seed).
  3. **Approval queue:** Query `SELECT p.id, p.companyName, p.nip, p.status, p.createdAt, u.phone, u.email FROM Provider p JOIN User u ON p.userId = u.id WHERE p.status = 'PENDING_APPROVAL' ORDER BY p.createdAt ASC`.
  4. Per-wiersz akcje: `[✓ Approve]` → POST /v1/admin/providers/:id/approve | `[✗ Reject]` → modal z „Powód" → POST /v1/admin/providers/:id/reject | `[Szczegóły]` → drawer ze zdjęciami S3.
- **Czas:** ~1,5h
- **Weryfikacja E2E:** signup w panel.opony.app → pending → zaloguj jako admin w Retool → Approve → provider dostaje SMS „konto aktywne" → login → dashboard.
- [ ] Retool połączone z Postgres + API
- [ ] Approval queue widoczny
- [ ] E2E approve flow działa

### TASK-035: Architekt — review BE-1b

- **Co:** Review auth + provider onboarding.
- **Jak:** Prompt: _"Review PR sprint-1/be-1b-auth-provider. Focus: JWT guards (role-based), OTP rate limiting, GUS mock + fallback CEIDG, S3 presigned URL security, state machine statusów Provider."_
- [ ] Review zrobiony

### TASK-036: Projektant — UI review FE-panel-1

- **Co:** Pixel-match z mockupami design phase.
- **Jak:** Prompt: _"UI review PR sprint-1/fe-panel-1-auth-wizard. Mockupy: design/b2b-12-login.html, b2b-02/03/04-onboarding-\*.html. Sprawdź pixel-match, @opony/design-system-web, responsive, a11y. Patrz footer <caption> każdego mockupu dla stanów + a11y baseline."_
- [ ] Review zrobiony

### TASK-037: FE swap MSW → real API

- **Co:** Podłącz panel do BE.
- **Jak:** `.env.local` → `NEXT_PUBLIC_API_MOCK=false`. Test: signup → NIP verify → upload → pending → admin Retool approve → provider login → dashboard placeholder.
- [ ] Provider panel działa end-to-end z real API + Retool

### TASK-038: Merge + checklista Sprint 1

- **Checklista Sprint 1:**
  - [ ] `pnpm build` — zero errors
  - [ ] Provider signup z Twilio OTP → NIP mock GUS → upload 3 zdjęć S3 → PENDING_APPROVAL
  - [ ] Admin Retool approve → SMS do providera + status APPROVED
  - [ ] Provider login OTP → dashboard placeholder (pełny w Sprint 3)
  - [ ] Swagger `/v1/docs` — endpointy /auth/_, /provider/_, /admin/providers/\*
  - [ ] **Typy odpowiedzi w Swagger** — każdy endpoint ma `@ApiResponse({ type: XxxResponseDto })` (patrz `architektura.md §9.A`)
  - [ ] **`pnpm generate:api-client`** — schema.d.ts zaktualizowany, typy nie driftują
  - [ ] **`cd apps/panel && npx tsc --noEmit`** — zero błędów TypeScript
  - [ ] Push do main → CI green

---

# FAZA 3: Sprint 2 — Provider profile CRUD (tydzień 2)

### TASK-039: Uruchom Agent BE-2 (Provider profile modules)

- **Co:** Pricing, Schedule, ServiceArea, Photos, Profile, Settings (zmiana tel 2-step OTP, sesje, soft-delete 30d).
- **Jak:** Branch `sprint-2/be-2-provider-crud`. Prompt BE-2 z nowego §20.
- **Czas:** 60–90 min
- **Weryfikacja:** Swagger → PUT /v1/provider/me/pricing (3 tiery) → save → GET → zachowane. Wszystkie endpointy z §20 BE-2 w Swagger.
- [ ] Uruchomiony + zweryfikowany

### TASK-040: Uruchom Agent FE-panel-2 (Cennik + Godziny + Strefa)

- **Co:** 3 ekrany konfiguracyjne + layout z sidebar.
- **Design reference:** `/design/b2b-05-cennik.html`, `b2b-06-godziny.html`, `b2b-07-strefa.html`, `b2b-01-dashboard.html` (layout wzór).
- **Jak:** Branch `sprint-2/fe-panel-2-crud`. Prompt FE-panel-2.
- **Weryfikacja:** Provider zalogowany → `http://localhost:3001/cennik` → 3 tiery z live preview. `/godziny` → 7 dni + per-day slot override. `/strefa` → Google Maps z draggable marker.
- [ ] Uruchomiony + zweryfikowany

### TASK-041: Uruchom Agent FE-panel-3 (Profil warsztatu + Ustawienia konta)

- **Co:** Edycja profilu publicznego (b2b-11) + ustawienia (b2b-14 z 6 sekcjami).
- **Design reference:** `/design/b2b-11-profil.html` (z live preview phone mockup), `b2b-14-ustawienia.html`.
- **Jak:** Branch `sprint-2/fe-panel-3-profil-ustawienia`. Prompt FE-panel-3.
- **Weryfikacja:** Profil z autosave + live preview + galeria reorder. Ustawienia: zmiana tel 2-step OTP, pauza 4 presety, notyfikacje matrix, sesje, danger zone z 3-step confirm.
- [ ] Uruchomiony + zweryfikowany

### TASK-042: Review + merge Sprint 2

- [ ] Architekt: review BE-2 (2-step OTP phone change, soft delete 30d, S3 upload validacje)
- [ ] Projektant: UI review FE-panel-2 + FE-panel-3 (pixel-match z 5 mockupami: b2b-05/06/07/11/14)
- [ ] FE swap MSW → real API
- [ ] Merge do main
- **Checklista Sprint 2:**
  - [ ] Provider approved → login → dashboard placeholder → cennik → save → reload → zachowane
  - [ ] Godziny: Pn-Pt 8-18, Sb 9-14, Nd closed → slot per day override działa
  - [ ] Strefa: drag marker + promień 15 km → save
  - [ ] Profil: edycja + 3 zdjęcia galerii → live preview się aktualizuje
  - [ ] Zmiana tel: OTP stary + nowy → zmiana w DB + AuditLog
  - [ ] Pauza warsztatu „Weekend" → isActive=false do pon 8:00

---

# FAZA 4: Sprint 3 — Provider daily ops + Booking entity + Landing v1 — ★ Milestone A (tydzień 3)

### TASK-043: Sprawdź status Twilio (production-ready)

- **Co:** Provider SMS notifications mają działać w Sprint 3.
- **Jak:** Zaloguj się do Twilio → sandbox działa? Trial balance ma $. Wyślij testowy SMS przez Twilio console.
- [ ] Twilio SMS działa

### TASK-044: Design — dodanie ekranu b2b-15-waiting-for-clients

- **Co:** Ekran pokazywany w Sprint 3-4 (ADR-009 „cichy okres" mitigation), gdy provider approved ale klient nie LIVE.
- **Status:** ✓ Utworzony (2026-04-23). Plik: `/design/b2b-15-waiting-for-clients.html`.
- **Jak używa:** FE-panel-5 w TASK-046 implementuje ten ekran. Toggle: `Provider.status=APPROVED AND COUNT(Booking)=0 AND TODAY<CLIENT_LAUNCH_DATE` → waiting; else standard dashboard.
- [x] Ekran istnieje

### TASK-045: Uruchom Agent BE-3 (Booking entity + manual booking + state machine)

- **Co:** Booking entity w BE, manual booking (provider wpisuje telefonicznego klienta), state machine, CSV export, review moderation.
- **Jak:** Branch `sprint-3/be-3-booking`. Prompt BE-3 z §20. POC v0 bez płatności (ADR-004). Client-side POST /bookings dopiero w Sprint 5.
- **Czas:** 60–90 min
- **Weryfikacja:** `POST /v1/provider/me/bookings` (manual) → CONFIRMED + SMS. GET /bookings/calendar?week=2026-17 → response format dla b2b-09. CSV export.
- [ ] Uruchomiony + zweryfikowany

### TASK-046: Uruchom Agent FE-panel-4 (Dashboard + Kalendarz + Lista + Szczegół)

- **Co:** 4 ekrany daily ops.
- **Design reference:** `/design/b2b-01-dashboard.html`, `b2b-09-kalendarz.html`, `b2b-13-rezerwacje.html`, `b2b-08-szczegol-rezerwacji.html`.
- **Jak:** Branch `sprint-3/fe-panel-4-daily-ops`. Prompt FE-panel-4.
- **Weryfikacja:** `/dashboard`, `/kalendarz`, `/rezerwacje`, `/rezerwacje/:id`. Manual booking modal działa (US-30).
- [ ] Uruchomiony + zweryfikowany

### TASK-047: Uruchom Agent FE-panel-5 (Opinie + Waiting-for-clients)

- **Co:** Opinie moderacja (b2b-10) + waiting-for-clients (b2b-15, fallback dla pustego dashboard w Fazie A).
- **Design reference:** `/design/b2b-10-opinie.html`, `b2b-15-waiting-for-clients.html`.
- **Jak:** Branch `sprint-3/fe-panel-5-opinie-waiting`. Prompt FE-panel-5. Ustaw env `CLIENT_LAUNCH_DATE=2026-05-14` (lub realny termin Fazy B).
- **Weryfikacja:** Provider bez bookings → widzi b2b-15 z countdown. Dodaj manual booking → widok przełącza się na b2b-01 dashboard.
- [ ] Uruchomiony + zweryfikowany

### TASK-048: Uruchom Agent FE-landing-1a (Landing provider-facing v1)

- **Co:** Minimalny landing `opony.app/` z hero promującym „Zarejestruj warsztat" (rekrutacja 8 pilotów). Pełna wersja client-facing w Sprint 6.
- **Design reference:** `/design/landing-01-home.html` — wziąć sekcję "For providers" i promować do hero.
- **Jak:** Branch `sprint-3/fe-landing-1a-provider`. Prompt FE-landing-1a.
- **Weryfikacja:** `opony.app` LIVE. Hero: „Zarządzaj rezerwacjami, nie telefonami". CTA → redirect do `panel.opony.app/signup`.
- [ ] Landing v1 LIVE

### TASK-049: Skonfiguruj Retool-2 — Booking management (HUMAN TASK)

- **Co:** Drugi Retool dashboard — audyt bookings + force-change status.
- **Jak:** Query `SELECT b.*, p.companyName, u.phone AS clientPhone FROM Booking b JOIN Provider p ON b.providerId=p.id JOIN User u ON b.userId=u.id ORDER BY b.startAt DESC LIMIT 100`. Per-wiersz: drill-down drawer, force status change z AuditLog zapisem.
- **Czas:** ~1h
- [ ] Booking management dashboard w Retool działa

### TASK-050: Review + merge Sprint 3

- [ ] Architekt: review BE-3 (state machine S:13.3, bookingExpiryCron, race condition 409 partial unique index, AuditLog)
- [ ] Projektant: UI review FE-panel-4 + FE-panel-5 + FE-landing-1a (pixel-match: b2b-01/08/09/10/13/15, landing-01 provider variant)
- [ ] FE swap MSW → real API
- [ ] Merge do main
- **Checklista Sprint 3:**
  - [ ] Provider: dashboard placeholder → widzi b2b-15 waiting-for-clients z countdown 21 dni
  - [ ] Dodaj manual booking (US-30) → widok przełącza się na b2b-01 dashboard
  - [ ] Kalendarz tygodniowy pokazuje manual booking w slocie
  - [ ] Lista rezerwacji z filtrami + CSV export
  - [ ] Provider odpowiada na opinię (seed z BE-1a)
  - [ ] `opony.app` LIVE z hero provider-facing v1
  - [ ] bookingExpiryCron: PENDING > 2h → CANCELLED_BY_SYSTEM + SMS

### TASK-051: ★ Milestone A gate — decyzja iterować vs lecieć do Fazy B

- **Co:** Koniec tygodnia 3-4. Portal LIVE, Retool działa, landing v1. Czas onboardować pilotów.
- **Kroki:**
  1. **Onboard 2-3 pilotów end-to-end w produkcji** (dogfooding) — ty wypełniasz z providerami ich portale.
  2. **GTM start — rekrutacja pozostałych 5-6 pilotów** przez `opony.app/` i telefoniczny outreach.
  3. **Decision gate:** jeśli pilot feedback wskazuje luki w panelu (ekrany brakujące / nieczytelne UX) → iteracja +1 tydzień w Fazie A. W przeciwnym razie → lecimy do Sprint 4 (Faza B).
- **Czas:** 3-5 dni (równolegle z ewentualną iteracją)
- [ ] 2-3 pilotów onboarded end-to-end
- [ ] Rekrutacja pozostałych 5-6 w toku
- [ ] Decision: start Sprint 4 (data: ...........) albo iterate Sprint 3 (feedback items: ...........)

---

# FAZA 5: Sprint 4 — Klient auth + catalog + mapa (tydzień 4)

> **★ Milestone A passed.** Faza B rusza. Klient dostanie realne dane 8 pilotów z Fazy A od dnia 1.

### TASK-052: Uruchom Agent BE-4 (Client auth + Vehicle + Provider listing)

- **Co:** Client-side /v1/me endpointy (reuse shared OTP z Sprint 1), Vehicle CRUD z katalogiem OE-size mock, Provider public listing z haversine, availability, waitlist (US-40).
- **Jak:** Branch `sprint-4/be-4-client-catalog`. Prompt BE-4 z §20 nowego planu.
- **Weryfikacja:** `GET /v1/providers?lat=49.62&lng=20.69&tireSize=205/55R16&sort=distance` → lista 8 pilotów z cenami + dystansami. `POST /v1/waitlist` działa.
- [ ] Uruchomiony + zweryfikowany

### TASK-053: Uruchom Agent FE-mobile-1 (Auth + onboarding post-OTP)

- **Co:** Expo RNW apka `apps/mobile` — login → OTP → consent → profil → pojazd (3 metody tire-size).
- **Design reference:** `/design/08-auth-phone.html`, `09-auth-otp.html`, `10-auth-consent.html`, `14-profil-setup.html`, `15-dodaj-pojazd.html`, `07-profile.html`.
- **Jak:** Branch `sprint-4/fe-mobile-1-auth-onboarding`. Prompt FE-mobile-1.
- **Weryfikacja:** Expo dev → `http://localhost:3000` → login → OTP → consent → profile setup → vehicle (3 tabs: Marka+Model+Rok / Wymiar / Skan disabled) → home placeholder.
- [ ] Uruchomiony + zweryfikowany

### TASK-054: Uruchom Agent FE-mobile-2 (Home + detail + mapa + empty states)

- **Co:** Catalog klienta + 3 warianty empty-state (US-40).
- **Design reference:** `/design/01-home.html`, `02-provider-detail.html`, `11-map.html`, `16-empty-waitlist.html`, `17-home-brak-pojazdu.html`, `18-home-brak-dostepnosci.html`.
- **Jak:** Branch `sprint-4/fe-mobile-2-catalog`. Prompt FE-mobile-2.
- **Weryfikacja:** Home pokazuje 8 pilotów onboarded w Sprint 3 (realne dane!). Detail: pełny profil. Map: Google Maps + piny. Empty states: user z Krakowa → waitlist, user bez pojazdu → widełki cen.
- [ ] Uruchomiony + zweryfikowany

### TASK-055: Review + merge Sprint 4

- [ ] Architekt: review BE-4 (haversine, availability slot generation, waitlist unique constraint)
- [ ] Projektant: UI review FE-mobile-1 + FE-mobile-2 (pixel-match 9 ekranów: 08-10, 14-15, 07, 01-02, 11, 16-18)
- [ ] FE swap MSW → real API
- [ ] Merge do main
- **Checklista Sprint 4:**
  - [ ] Client login OTP → consent → profile setup → vehicle → home
  - [ ] Home widzi 8 pilotów z Fazy A (realne dane!)
  - [ ] Klik na providera → pełny profil (cennik, godziny, opinie top 3)
  - [ ] Mapa: 8 pinów, tap → mini-karta
  - [ ] Empty: user z Krakowa → waitlist; user bez pojazdu → widełki cen + CTA

---

# FAZA 6: Sprint 5 — Klient booking flow + provider PENDING accept (tydzień 5)

### TASK-056: Uruchom Agent BE-5 (POST /bookings + availability + slot lock)

- **Co:** Client-side booking (state machine z Sprint 3 BE-3). POST /v1/bookings z partial unique index, cancel, favorites.
- **Jak:** Branch `sprint-5/be-5-client-booking`. Prompt BE-5 z §20.
- **Weryfikacja:** `POST /v1/bookings` → PENDING + SMS do providera. 409 race condition zwraca 3 alternatywy.
- [ ] Uruchomiony + zweryfikowany

### TASK-057: Uruchom Agent FE-mobile-3 (Booking flow + historia)

- **Co:** 4 ekrany booking flow klienta.
- **Design reference:** `/design/03-time-slot.html`, `04-booking-confirmed.html`, `05-my-bookings.html`, `06-booking-detail.html`.
- **Jak:** Branch `sprint-5/fe-mobile-3-booking`. Prompt FE-mobile-3.
- **Weryfikacja:** Klient: provider → slot → „Zarezerwuj 180 zł" → kod OPN-XXXX + .ics. Historia z tabs Nadchodzące/Historia.
- [ ] Uruchomiony + zweryfikowany

### TASK-058: Uruchom Agent FE-panel-6 (Provider PENDING accept refinement)

- **Co:** Rozbuduj dashboard z Sprint 3 — PENDING inbox ma teraz realne bookings od klientów (z Sprint 5). Push-like notification + auto-refresh 30s polling.
- **Jak:** Branch `sprint-5/fe-panel-6-pending-refine`. Prompt FE-panel-6 z §20.
- **Weryfikacja:** Klient rezerwuje → provider dashboard auto-refresh → PENDING visible → Akceptuj → klient SMS „Potwierdzone".
- [ ] Uruchomiony + zweryfikowany

### TASK-059: Review + merge Sprint 5

- [ ] Architekt: review BE-5 (race condition 409, Idempotency-Key, state machine z Sprint 3)
- [ ] Projektant: UI review FE-mobile-3 (pixel-match 03-06)
- [ ] FE swap + merge
- **Checklista Sprint 5:**
  - [ ] Klient: search → provider → slot → rezerwuj → PENDING + SMS do providera
  - [ ] Provider: dashboard auto-refresh → PENDING → Akceptuj → klient dostaje SMS „Potwierdzone"
  - [ ] Double-booking: 2 klientów → 1 × 409 z 3 alternatywami
  - [ ] Adres poza strefą → inline error
  - [ ] bookingExpiryCron: PENDING > 2h → CANCELLED_BY_SYSTEM

---

# FAZA 7: Sprint 6 — Ratings + polish + landing client pivot — ★ Milestone B (tydzień 6)

### TASK-060: Uruchom Agent BE-6 (Review + cron updateRatingCache + completionReminder)

- **Co:** Review module z filtrem wulgaryzmów PL + 2 crony.
- **Jak:** Branch `sprint-6/be-6-reviews`. Prompt BE-6 z §20.
- **Weryfikacja:** `POST /v1/bookings/:id/review` → review zapisany. Cron updateRatingCache → Provider.avgRating się aktualizuje. Cron completionReminder → SMS po 24h COMPLETED bez review.
- [ ] Uruchomiony + zweryfikowany

### TASK-061: Uruchom Agent FE-mobile-4 (Rate + reviews list)

- **Co:** Ocena wizyty + pełna lista opinii providera.
- **Design reference:** `/design/12-rate-visit.html`, `13-reviews.html`.
- **Jak:** Branch `sprint-6/fe-mobile-4-ratings`. Prompt FE-mobile-4.
- [ ] Uruchomiony + zweryfikowany

### TASK-062: Uruchom Agent FE-mobile-5 (Polish: offline + PWA install + error boundary)

- **Co:** 3 polish ekrany/komponenty.
- **Design reference:** `/design/19-offline-state.html`, `20-pwa-install.html`, `21-error-boundary.html`.
- **Jak:** Branch `sprint-6/fe-mobile-5-polish`. Prompt FE-mobile-5.
- **Weryfikacja:** Chrome DevTools → Network offline → offline banner + cache badges. 2 wizyty → PWA install prompt. React crash → error boundary z Sentry errorId.
- [ ] Uruchomiony + zweryfikowany

### TASK-063: Uruchom Agent FE-landing-2 (Landing client pivot + /p/slug + /nowy-sacz)

- **Co:** Pivot landing z v1 (provider) na v2 (client-facing + provider section below fold) + 2 nowe trasy.
- **Design reference:** `/design/landing-01-home.html`, `landing-02-profil-publiczny.html`, `landing-03-miasto.html`.
- **Jak:** Branch `sprint-6/fe-landing-2-client-pivot`. Prompt FE-landing-2.
- **Weryfikacja:** `opony.app/` — hero client-facing. `opony.app/p/wulkanizacja-nowy-sacz` — SSR + OG preview (Facebook debugger). `opony.app/nowy-sacz` — SEO listing z 8 pilotami.
- [ ] 3 trasy LIVE

### TASK-064: Review + merge Sprint 6 — ★ Milestone B gate

- [ ] Architekt: review BE-6 (review filter wulgaryzmów, cron idempotency)
- [ ] Projektant: UI review FE-mobile-4/5 + FE-landing-2 (pixel-match 12, 13, 19-21, landing-01/02/03)
- [ ] FE swap + merge
- [ ] **SEO:** Submit sitemap do Google Search Console. Test OG preview w FB debugger.
- **Checklista Sprint 6 + Milestone B:**
  - [ ] Ocena wizyty po COMPLETED → widoczna w profilu providera
  - [ ] Provider odpowiada na opinię
  - [ ] Offline mode: cache działa, booking zablokowane offline
  - [ ] PWA install: Android native prompt, iOS tutorial + QR
  - [ ] Error boundary: crash → screen z errorId, Sentry capture
  - [ ] `opony.app` client-facing LIVE
  - [ ] `opony.app/p/<slug>` SSR + OG działa (share na FB pokazuje bogaty preview)
  - [ ] `opony.app/nowy-sacz` SEO listing LIVE
  - [ ] F&F testing: 3-5 osób rezerwuje → pozytywny feedback
  - [ ] **Gate:** decyzja soft launch Sprint 7 (data: ...........) lub dodatkowa iteracja

---

# FAZA 8: Sprint 7 — Polish + Soft-launch (tydzień 7)

### TASK-065: Uruchom 5 agentów Sprint 7

- [ ] BE-8a (booking detail + manual + eskalacja) — branch `sprint-7/be-8a`
- [ ] BE-8b (crony systemowe) — branch `sprint-7/be-8b`
- [ ] FE-8 (B2B szczegół + manual booking) — branch `sprint-7/fe-8`
- [ ] QA-E2E (Playwright testy) — branch `sprint-7/qa-e2e`
- [ ] QA-CRON (testy cronów) — branch `sprint-7/qa-cron`

### TASK-066: Architekt — Security audit

- **Co:** Przegląd bezpieczeństwa przed launch.
- **Jak:** Prompt: _"Security audit repo opony. Sprawdź: auth (JWT expiry, rate limiting), injection (SQL, XSS), RODO (dane osobowe, soft delete, anonimizacja), dependencies (npm audit), env vars (żadne secrets w kodzie)."_
- [ ] Audit zrobiony
- [ ] Krytyczne issues naprawione

### TASK-067: Projektant — A11y audit

- **Co:** Przegląd dostępności.
- **Jak:** Prompt: _"A11y audit client PWA + provider panel. Sprawdź: semantic HTML, ARIA labels, focus states, keyboard navigation, kontrast WCAG AA, screen reader (VoiceOver/NVDA sim)."_
- [ ] Audit zrobiony
- [ ] Krytyczne issues naprawione

### TASK-068: Final merge + checklista

- [ ] Merge wszystkich PR-ów
- **FINAL checklista:**
  - [ ] E2E klient: login → szukaj → rezerwuj → zapłać → SMS
  - [ ] E2E provider: login → dashboard → akceptuj → rozpocznij → zakończ
  - [ ] E2E onboarding: signup → NIP → upload → approve → login
  - [ ] Crony: NO_SHOW ✓, bookingExpiry ✓, ratingCache ✓ (weeklyPayouts/paymentTimeout usunięte — ADR-004)
  - [ ] Lighthouse PWA > 80
  - [ ] p95 API < 300 ms
  - [ ] `npm audit` — zero critical

---

# FAZA 9: Deploy + Soft-launch (tydzień 8)

### TASK-069: Zamień credentials na produkcyjne

- **Co:** Podmień sandbox → prod dla Twilio, S3, Resend (P24 nie dotyczy v0 — ADR-004).
- **Jak:** W Railway → Environment Variables → ustaw produkcyjne wartości. W Vercel → Environment Variables per project.
- **⚠** NIGDY nie commituj produkcyjnych secrets do repo!
- [ ] Railway env vars ustawione
- [ ] Vercel env vars ustawione (×3 projekty)
- [ ] `NEXT_PUBLIC_API_MOCK=false` wszędzie

### TASK-070: Deploy na produkcję

- **Co:** Uruchom aplikację na prawdziwych serwerach.
- **Jak:** (1) Railway: połącz z GitHub `main` branch → auto-deploy API. (2) Vercel: Import 3 projekty (client, provider, landing) z monorepo.
- **Weryfikacja:** Otwórz `https://api.opony.app/v1/health` → `{"status":"ok"}`
- [ ] API deployed na Railway
- [ ] Client deployed na Vercel
- [ ] Provider deployed na Vercel
- [ ] Landing deployed na Vercel

### TASK-071: Skonfiguruj DNS

- **Co:** Podepnij domenę pod 4 aplikacje.
- **Jak:** W panelu rejestratora:
  1. `opony.app` → CNAME / A → Vercel (landing — `apps/landing`)
  2. `app.opony.app` → CNAME → Vercel (mobile web export — `apps/mobile` via `expo export:web`)
  3. `panel.opony.app` → CNAME → Vercel (provider portal — `apps/panel`)
  4. `api.opony.app` → CNAME → Railway (NestJS API)
- **Uwaga:** `app.opony.app` musi też hostować pliki pod `.well-known/apple-app-site-association` i `.well-known/assetlinks.json` (Universal Links / App Links — patrz TASK-071b).
- [ ] DNS skonfigurowany (4 subdomeny)
- [ ] SSL automatyczny (Vercel + Railway)

### TASK-071b: Universal Links (iOS) + App Links (Android) ⚠️ **v0.5 bloker dla deep-link z mobile do panel**

- **Co:** Pliki `apple-app-site-association` (iOS) i `assetlinks.json` (Android) hostowane na `app.opony.app/.well-known/` → umożliwiają otwarcie linku `panel.opony.app/xxx` z mobile Expo apki przez natywny browser (zamiast webview).
- **Jak:**
  1. Skonfiguruj w `apps/mobile/app.json` sekcję `ios.associatedDomains: ["applinks:app.opony.app", "applinks:panel.opony.app"]` i `android.intentFilters` (Expo config docs).
  2. Wygeneruj `apple-app-site-association` — JSON z `appID: TEAMID.app.opony.mobile`, ścieżki `/*` dla app.opony.app oraz `/admin/*` dla panel.opony.app.
  3. Wygeneruj `assetlinks.json` — JSON z SHA-256 fingerprint keystore'u Google Play.
  4. Deploy plików jako static assets w `apps/landing/public/.well-known/` (serwowane przez Vercel).
  5. Test: `branch.io/resources/aasa-validator/` + `developers.google.com/digital-asset-links/tools/generator`.
- **Kiedy:** v0.5 (razem z pierwszym publishingiem do TestFlight). **Nie potrzebne w v0 czystym (web-only).**
- [ ] AASA wygenerowane i hostowane
- [ ] assetlinks.json wygenerowany i hostowany
- [ ] Deep-link test: `opony://admin` otwiera panel w Expo apce
- [ ] Wszystkie 4 domeny działają

### TASK-072: Wyczyść bazę produkcyjną

- **Co:** Usuń dane testowe z seeda.
- **Jak:** Railway → Postgres → Query: `TRUNCATE ALL TABLES CASCADE` (lub `npx prisma migrate reset` na produkcji — UWAŻAJ!)
- **Rezultat:** Czysta baza, gotowa na prawdziwych userów
- [ ] Baza wyczyszczona

### TASK-073: Załóż konto admina

- **Co:** Twój admin w bazie produkcyjnej.
- **Jak:** Railway Postgres → INSERT INTO "User" (id, phone, role) VALUES (uuid, '+48TWOJNUMER', 'ADMIN')
- [ ] Admin stworzony
- [ ] Retool połączony z produkcyjną bazą

### TASK-074: Smoke test produkcji

- **Co:** Przejdź ręcznie kluczowy flow na produkcji.
- [ ] Klient: login OTP (prawdziwy SMS!) → profil → pojazd
- [ ] Klient: szukaj → (pusta lista — brak providerów)
- [ ] Provider: signup → NIP verify (prawdziwy GUS!) → upload → PENDING_APPROVAL
- [ ] Admin (Retool): approve provider
- [ ] Provider: login → dashboard → cennik → godziny → strefa
- [ ] Klient: szukaj → provider widoczny → rezerwuj → SMS do providera → provider accept → CONFIRMED (po wizycie klient płaci offline, v0 bez inline payments)

---

# FAZA 10: Onboarding providerów (tydzień 8–9)

### TASK-075: Onboarding 8 pilotażowych providerów

- **Co:** Osobiście (!) pomóż 8 providerom założyć konto.
- **Jak:** Patrz `analiza-biznesowa.md` sekcja 17.5 (onboarding playbook). Wizyta na miejscu + demo na tablecie.
- **Na każdego providera:**
  - [ ] Wizyta / demo
  - [ ] Provider się zarejestrował (NIP, telefon, email)
  - [ ] Upload 3 zdjęć
  - [ ] Ty: approve w Retool
  - [ ] Provider: ustawił cennik
  - [ ] Provider: ustawił godziny pracy
  - [ ] Provider: ustawił strefę obsługi
  - [ ] Test: zarezerwuj u niego z innego telefonu → SMS → działa

### TASK-076: Seed demand — pierwsi klienci

- **Co:** Wygeneruj pierwsze rezerwacje (bez nich providerzy odejdą).
- **Jak:** Patrz `analiza-biznesowa.md` sekcja 17.9.
- [ ] Friends & family: 20 SMS z kodem RODZINA
- [ ] Sam zarezerwuj u każdego z 8 providerów (test + seed)
- [ ] Grupy FB: post z kodem -30 zł
- [ ] Google Ads: kampania „wymiana opon nowy sącz" — 50 PLN/dzień × 14 dni
- [ ] Cel: 20+ rezerwacji w pierwszym tygodniu

---

# FAZA 11: Monitoring + Iteracja (tydzień 9+)

### TASK-077: Codzienny monitoring (pierwsze 2 tygodnie)

- **Codziennie 15 min:**
  - [ ] Sentry → nowe błędy? → jeśli critical → uruchom deva na fix
  - [ ] Retool dashboard → ile rezerwacji dziś? PENDING bez reakcji > 4h?
  - [ ] PostHog → funnel: ile wchodzi na stronę → ile rezerwuje? Gdzie drop?
  - [ ] Twilio logs → SMS-y dochodzą?

### TASK-078: Tygodniowy check-in z providerami

- **Co tydzień:**
  - [ ] Zadzwoń do 3 providerów: „Jak leci? Problemy?"
  - [ ] Zbierz feedback → zapisz w notatce
  - [ ] Jeśli bug → zgłoś → uruchom agenta na fix

### TASK-079: Decyzja po 2 tygodniach

- **Po 2 tyg od soft-launch oceń:**
  - [ ] Ile rezerwacji? (cel: > 20 w 2 tyg.)
  - [ ] Ile aktywnych providerów? (cel: > 5 z 8)
  - [ ] NPS prowiderów (zapytaj 1–10)
  - [ ] Critical bugi? Czy platforma jest stabilna?
  - **Jeśli OK:** → Public launch (TASK-080)
  - **Jeśli NIE:** → Iteracja (napraw bugi, dodaj feedback, spróbuj ponownie)

### TASK-080: Public launch

- [ ] Kampania marketingowa pełna (sekcja 17.8 w `analiza-biznesowa.md`)
- [ ] Kolejni providerzy (tier 2–3)
- [ ] Partnerstwa lokalne (myjnie, stacje)
- [ ] Monitoring weekly KPI

---

# Podsumowanie: 72 taski

| Faza                                 |      Taski | Twój czas           |
| ------------------------------------ | ---------: | ------------------- |
| 0. Przygotowanie (konta + env)       |         22 | ~3–4h (jednorazowo) |
| 1. Sprint 0 (scaffold)               |          6 | ~2h                 |
| 2. Sprint 1 (auth)                   |         11 | ~3–4h               |
| 3. Sprint 2 (katalog)                |          3 | ~2h                 |
| 4. Sprint 3 (rezerwacja) + GTM start |          5 | ~3h + GTM           |
| 5. Sprint 4 (B2B)                    |          4 | ~3h                 |
| 6. Sprint 5 (oceny)                  |          2 | ~2h                 |
| 7. Sprint 6 (onboarding)             | 3 + Retool | ~4h                 |
| 8. Sprint 7 (polish)                 |          4 | ~4h                 |
| 9. Deploy + soft-launch              |          6 | ~full day           |
| 10. Onboarding providerów            |          2 | ~full week          |
| 11. Monitoring + launch              |          4 | ongoing             |
| **RAZEM**                            |     **72** | **~9 tygodni**      |
