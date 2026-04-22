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
     - **Klient mobile** — `design/01-home.html`, `design/03-time-slot.html`, `design/07-profile.html` *(typowy booking flow)*
     - **Panel B2B** — `design/b2b-01-dashboard.html`, `design/b2b-08-szczegol-rezerwacji.html` *(daily ops providera)*
     - **Landing** — `design/landing-01-home.html`, `design/landing-02-profil-publiczny.html` *(marketing + share)*
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

# FAZA 2: Sprint 1 — Auth + Profil (tydzień 1)

### TASK-029: Uruchom Agent BE-1a (Schema Owner)
- **Co:** Stworzenie PEŁNEGO schematu Prisma (14 tabel) + seed data.
- **Jak:** Branch `sprint-1/be-1a-schema`. Wklej prompt BE-1a z sekcji 20. Dodaj kontekst: _"Repo istnieje ze scaffoldu Sprint 0. Pracujesz w /apps/api. Stwórz schemat Prisma ze WSZYSTKIMI tabelami zgodnie z architektura.md sekcja 8."_
- **Czas:** 20–30 min
- **Weryfikacja:** `pnpm db:migrate` → 14+ tabel. `pnpm db:seed` → dane w DB. `npx prisma studio` → przeglądaj dane.
- **⚠ KRYTYCZNE:** To fundament. Uruchom Architekta na review ZANIM merge'ujesz!
- [ ] Agent uruchomiony
- [ ] Migracja działa
- [ ] Seed dane widoczne w Prisma Studio

### TASK-030: Architekt — review schematu BE-1a
- **Co:** Code review schematu Prisma — najważniejszy review w projekcie.
- **Jak:** Uruchom Claude Code z promptem: _"Zrób review PR sprint-1/be-1a-schema. Sprawdź schema.prisma i seed.ts. Referencja: docs/architektura.md sekcja 8. Sprawdź: wszystkie tabele obecne, typy pól, relacje FK, unique constraints (partial index!), enumy, indeksy. Zaakceptuj lub odrzuć z komentarzami."_
- **Rezultat:** Lista komentarzy lub approval
- [ ] Review zrobiony
- [ ] Schema approved (po ewentualnych poprawkach)

### TASK-031: Merge BE-1a do main
- **Co:** Schema owner merge'uje PIERWSZY — reszta agentów na niego czeka.
- **Jak:** `git checkout main && git merge sprint-1/be-1a-schema && git push`
- [ ] Merge zrobiony

### TASK-032: Uruchom Agent BE-1b (Auth logic)
- **Co:** Moduł autentykacji OTP + user + vehicle.
- **Jak:** Branch `sprint-1/be-1b-auth`. Wklej prompt BE-1b. Dodaj: _"Schema Prisma jest gotowa (merge BE-1a). Pracujesz na gotowych tabelach — NIE twórz migracji."_
- **Czas:** 30–45 min
- **Weryfikacja:** Swagger → `POST /v1/auth/otp/request` + `/verify` → JWT
- [ ] Agent uruchomiony
- [ ] OTP flow działa w Swagger

### TASK-033: Uruchom Agent BE-2 (Provider onboarding)
- **Co:** Rejestracja providera + GUS NIP verify.
- **Jak:** Branch `sprint-1/be-2-provider`. Wklej prompt BE-2. Może startować równolegle z BE-1b (oba na gotowym schemacie).
- **Czas:** 30–45 min
- **Weryfikacja:** Swagger → `POST /v1/provider/signup` → Provider created
- [ ] Agent uruchomiony
- [ ] Signup flow działa

### TASK-034: Uruchom Agent FE-1 (Klient auth UI)
- **Co:** Ekrany logowania klienta (OTP + regulamin + profil + pojazdy).
- **Jak:** Branch `sprint-1/fe-1-client-auth`. Wklej prompt FE-1. Agent startuje z MSW mockami — NIE czeka na BE.
- **Czas:** 30–60 min
- **Weryfikacja:** `http://localhost:3000` → ekran logowania → wpisz numer → OTP → profil
- [ ] Agent uruchomiony
- [ ] Flow działa z MSW

### TASK-035: Uruchom Agent FE-2 (B2B wizard krok 1)
- **Co:** Formularz rejestracji providera.
- **Jak:** Branch `sprint-1/fe-2-b2b-wizard`. Wklej prompt FE-2.
- **Czas:** 20–30 min
- **Weryfikacja:** `http://localhost:3001` → formularz NIP + auto-fill + zgody
- [ ] Agent uruchomiony
- [ ] Wizard step 1 działa z MSW

### TASK-036: Architekt — review BE-1b + BE-2
- **Co:** Code review logiki auth i provider onboardingu.
- **Jak:** Uruchom Architekta na oba PR-y. Focus: JWT guards, OTP rate limiting, GUS mock, error handling.
- [ ] BE-1b reviewed
- [ ] BE-2 reviewed

### TASK-037: Projektant — UI review FE-1 + FE-2
- **Co:** Sprawdzenie zgodności UI z wireframami.
- **Jak:** Uruchom Projektanta z promptem: _"UI review PR sprint-1/fe-1-client-auth. Wireframy: plan-sprintow.md sekcja 12.16 (OTP), 12.11 (profil). Sprawdź: zgodność z wireframe, @opony/design-system, responsive, a11y."_
- [ ] FE-1 reviewed
- [ ] FE-2 reviewed

### TASK-038: FE swap MSW → real API
- **Co:** Podłącz frontend do prawdziwego backendu.
- **Jak:** W `.env.local` ustaw `NEXT_PUBLIC_API_MOCK=false`. Uruchom `pnpm dev`. Przetestuj: login OTP → profil.
- **⚠** Jeśli coś nie działa — to normalne przy pierwszym swap. Napraw ręcznie lub uruchom agenta z opisem problemu.
- [ ] Client PWA działa z real API
- [ ] Provider panel działa z real API

### TASK-039: Merge + checklista Sprint 1
- **Co:** Merge wszystkich PR-ów + weryfikacja.
- **Jak:** Merge: BE-1b → main, BE-2 → main (rebase), FE-1 → main, FE-2 → main.
- **Checklista Sprint 1:**
  - [ ] `pnpm build` — zero errors
  - [ ] OTP login → JWT → GET /v1/me → profil
  - [ ] Provider signup → NIP verify → PENDING_DOCS
  - [ ] Swagger `/v1/docs` — endpointy auth + provider
  - [ ] Seed data rozszerzony
  - [ ] Push do main → CI green

---

# FAZA 3: Sprint 2 — Katalog + Mapa (tydzień 2)

### TASK-040: Uruchom Agent BE-3 (Katalog + availability)
- **Co:** API listingu providerów z cenami, slotami, dystansem.
- **Jak:** Branch `sprint-2/be-3-catalog`. Prompt BE-3 z sekcji 20.
- **Weryfikacja:** Swagger → `GET /v1/providers?lat=49.62&lng=20.69` → lista providerów z seeda
- [ ] Uruchomiony + zweryfikowany

### TASK-041: Uruchom Agent FE-3 (Lista + Mapa + Filtry)
- **Co:** Główny ekran klienta — wyszukiwarka z mapą.
- **Jak:** Branch `sprint-2/fe-3-catalog`. Prompt FE-3. MSW od dnia 1.
- **Weryfikacja:** `localhost:3000` → mapa z pinami + lista kart
- [ ] Uruchomiony + zweryfikowany

### TASK-042: Review + merge Sprint 2
- [ ] Architekt: review BE-3
- [ ] Projektant: UI review FE-3 (wireframy 12.1, 12.13)
- [ ] FE-3: swap MSW → real API
- [ ] Merge do main
- **Checklista Sprint 2:**
  - [ ] Mapa z 5 providerami
  - [ ] Filtry: „Dziś" → lista się kurczy
  - [ ] Empty state: wpisz „Wrocław" → waitlist

---

# FAZA 4: Sprint 3 — Rezerwacja + Płatności (tydzień 3)

### TASK-043: Sprawdź status Twilio
- **Co:** Upewnij się, że credentials z TASK-003 są gotowe.
- **Jak:** Zaloguj się do Twilio → SMS wysyłany?
- [ ] Twilio SMS działa (wyślij testowy na swój numer)

### TASK-044: Uruchom Agent BE-4 (Booking + bookingExpiryCron)
- **Co:** Moduł rezerwacji bez płatności (ADR-004) + cron bookingExpiry (PENDING > 2h → auto-cancel).
- **Jak:** Branch `sprint-3/be-4-booking`. Prompt BE-4 z sekcji 20.
- **Weryfikacja:** Swagger → `POST /v1/bookings` → zwraca `{booking}` ze statusem PENDING + SMS do providera wysłany.
- [ ] Uruchomiony + zweryfikowany

### TASK-045: Uruchom Agent FE-4 (Booking flow)
- **Co:** Flow rezerwacji klienta: wybór slotu → potwierdzenie PENDING (bez płatności).
- **Jak:** Branch `sprint-3/fe-4-booking`. Prompt FE-4.
- **Weryfikacja:** Expo → provider → slot → „Zarezerwuj termin" → potwierdzenie PENDING
- [ ] Uruchomiony + zweryfikowany

### TASK-046: Review + merge Sprint 3
- [ ] Architekt: review BE-4 (race condition 409, bookingExpiryCron, idempotency)
- [ ] Projektant: UI review FE-4 (wireframy 12.2, 12.3, 12.4 — **bez 12.8**, ADR-004)
- [ ] Swap MSW → real
- [ ] Merge do main
- **Checklista Sprint 3:**
  - [ ] Szukaj → provider → slot → rezerwuj → PENDING + SMS do providera
  - [ ] Double-booking: 2 okna → 1 sukces, 1 × 409
  - [ ] Adres poza strefą → inline error
  - [ ] bookingExpiryCron: czekaj 2h → PENDING → CANCELLED_BY_SYSTEM + SMS do klienta

### TASK-047: Zacznij GTM! (równolegle z kolejnymi sprintami)
- **Co:** Od teraz masz działający produkt. Zacznij pozyskiwanie providerów.
- **Jak:** Przeczytaj `analiza-biznesowa.md` sekcja 17 → research Google Maps → Excel → dzwonienie.
- **Cel przed Sprint 6:** 5 zainteresowanych providerów
- [ ] Research zrobiony (Excel z providerami w Nowym Sączu)
- [ ] Pierwsze 5 telefonów wykonanych

---

# FAZA 5: Sprint 4 — Panel B2B (tydzień 4)

### TASK-048: Uruchom Agent BE-5 (Provider panel + S3)
- **Jak:** Branch `sprint-4/be-5-panel`. Prompt BE-5.
- [ ] Uruchomiony + zweryfikowany

### TASK-049: Uruchom Agent FE-5a (Login + Dashboard)
- **Jak:** Branch `sprint-4/fe-5a-dashboard`. Prompt FE-5a.
- [ ] Uruchomiony + zweryfikowany

### TASK-050: Uruchom Agent FE-5b (Cennik + Godziny + Strefa)
- **Jak:** Branch `sprint-4/fe-5b-crud`. Prompt FE-5b.
- [ ] Uruchomiony + zweryfikowany

### TASK-051: Review + merge Sprint 4
- [ ] Architekt: review BE-5 (state machine booking — KRYTYCZNE!)
- [ ] Projektant: UI review FE-5a + FE-5b (wireframy 12.5, 12.7)
- [ ] Swap + merge
- **Checklista Sprint 4:**
  - [ ] Provider login (OTP) → dashboard
  - [ ] Akceptuj → CONFIRMED, klient SMS
  - [ ] Cennik → save → reload → zachowane
  - [ ] Upload zdjęcie → S3

---

# FAZA 6: Sprint 5 — Oceny + Rozliczenia (tydzień 5)

### TASK-052: Uruchom 3 agentów Sprint 5
- [ ] BE-6 (reviews + settlement + refund) — branch `sprint-5/be-6`
- [ ] FE-6a (profil providera + oceny) — branch `sprint-5/fe-6a`
- [ ] FE-6b (B2B opinie + finanse) — branch `sprint-5/fe-6b`

### TASK-053: Review + merge Sprint 5
- [ ] Architekt: review BE-6 (Review CRUD + filtr wulgaryzmów — settlement/refund usunięte, ADR-004)
- [ ] Projektant: UI review FE-6a + FE-6b (wireframy 12.2, 12.12, 12.17, 12.14)
- [ ] Swap + merge
- **Checklista Sprint 5:**
  - [ ] Ocena po COMPLETED → widoczna w profilu
  - [ ] Provider odpowiada na opinię
  - [ ] Settlement obliczony po COMPLETED
  - [ ] Anulowanie > 2h → status CANCELLED, brak kosztów dla klienta (ADR-004 — brak refundu bo brak płatności)

---

# FAZA 7: Sprint 6 — Onboarding + System (tydzień 6)

### TASK-054: Uruchom 3 agentów Sprint 6
- [ ] BE-7 (upload + admin + crony) — branch `sprint-6/be-7`
- [ ] FE-7a (rezerwacje klient + RODO) — branch `sprint-6/fe-7a`
- [ ] FE-7b (onboarding wizard 2–3) — branch `sprint-6/fe-7b`

### TASK-055: Skonfiguruj Retool (HUMAN TASK — Ty!)
- **Co:** 5 ekranów admin panelu.
- **Jak:** Patrz instrukcja w `plan-sprintow.md` sekcja 20, Sprint 6, HUMAN TASK.
- **Czas:** ~3h
- [ ] Providers dashboard (approve/reject)
- [ ] Bookings dashboard
- [ ] Reviews moderation
- [ ] Users management
- [ ] Stats dashboard

### TASK-056: Review + merge Sprint 6
- [ ] Architekt: review BE-7
- [ ] Projektant: UI review FE-7a + FE-7b
- [ ] Merge
- **Checklista Sprint 6:**
  - [ ] Onboarding: signup → NIP → upload → PENDING_APPROVAL
  - [ ] Retool: approve → SMS do providera
  - [ ] Klient: lista rezerwacji
  - [ ] Cron NO_SHOW: rez sprzed 35 min → automatycznie

---

# FAZA 8: Sprint 7 — Polish + Soft-launch (tydzień 7)

### TASK-057: Uruchom 5 agentów Sprint 7
- [ ] BE-8a (booking detail + manual + eskalacja) — branch `sprint-7/be-8a`
- [ ] BE-8b (crony systemowe) — branch `sprint-7/be-8b`
- [ ] FE-8 (B2B szczegół + manual booking) — branch `sprint-7/fe-8`
- [ ] QA-E2E (Playwright testy) — branch `sprint-7/qa-e2e`
- [ ] QA-CRON (testy cronów) — branch `sprint-7/qa-cron`

### TASK-058: Architekt — Security audit
- **Co:** Przegląd bezpieczeństwa przed launch.
- **Jak:** Prompt: _"Security audit repo opony. Sprawdź: auth (JWT expiry, rate limiting), injection (SQL, XSS), RODO (dane osobowe, soft delete, anonimizacja), dependencies (npm audit), env vars (żadne secrets w kodzie)."_
- [ ] Audit zrobiony
- [ ] Krytyczne issues naprawione

### TASK-059: Projektant — A11y audit
- **Co:** Przegląd dostępności.
- **Jak:** Prompt: _"A11y audit client PWA + provider panel. Sprawdź: semantic HTML, ARIA labels, focus states, keyboard navigation, kontrast WCAG AA, screen reader (VoiceOver/NVDA sim)."_
- [ ] Audit zrobiony
- [ ] Krytyczne issues naprawione

### TASK-060: Final merge + checklista
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

### TASK-061: Zamień credentials na produkcyjne
- **Co:** Podmień sandbox → prod dla Twilio, S3, Resend (P24 nie dotyczy v0 — ADR-004).
- **Jak:** W Railway → Environment Variables → ustaw produkcyjne wartości. W Vercel → Environment Variables per project.
- **⚠** NIGDY nie commituj produkcyjnych secrets do repo!
- [ ] Railway env vars ustawione
- [ ] Vercel env vars ustawione (×3 projekty)
- [ ] `NEXT_PUBLIC_API_MOCK=false` wszędzie

### TASK-062: Deploy na produkcję
- **Co:** Uruchom aplikację na prawdziwych serwerach.
- **Jak:** (1) Railway: połącz z GitHub `main` branch → auto-deploy API. (2) Vercel: Import 3 projekty (client, provider, landing) z monorepo.
- **Weryfikacja:** Otwórz `https://api.opony.app/v1/health` → `{"status":"ok"}`
- [ ] API deployed na Railway
- [ ] Client deployed na Vercel
- [ ] Provider deployed na Vercel
- [ ] Landing deployed na Vercel

### TASK-063: Skonfiguruj DNS
- **Co:** Podepnij domenę pod 4 aplikacje.
- **Jak:** W panelu rejestratora:
  1. `opony.app` → CNAME / A → Vercel (landing — `apps/landing`)
  2. `app.opony.app` → CNAME → Vercel (mobile web export — `apps/mobile` via `expo export:web`)
  3. `panel.opony.app` → CNAME → Vercel (provider portal — `apps/panel`)
  4. `api.opony.app` → CNAME → Railway (NestJS API)
- **Uwaga:** `app.opony.app` musi też hostować pliki pod `.well-known/apple-app-site-association` i `.well-known/assetlinks.json` (Universal Links / App Links — patrz TASK-063b).
- [ ] DNS skonfigurowany (4 subdomeny)
- [ ] SSL automatyczny (Vercel + Railway)

### TASK-063b: Universal Links (iOS) + App Links (Android) ⚠️ **v0.5 bloker dla deep-link z mobile do panel**
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

### TASK-064: Wyczyść bazę produkcyjną
- **Co:** Usuń dane testowe z seeda.
- **Jak:** Railway → Postgres → Query: `TRUNCATE ALL TABLES CASCADE` (lub `npx prisma migrate reset` na produkcji — UWAŻAJ!)
- **Rezultat:** Czysta baza, gotowa na prawdziwych userów
- [ ] Baza wyczyszczona

### TASK-065: Załóż konto admina
- **Co:** Twój admin w bazie produkcyjnej.
- **Jak:** Railway Postgres → INSERT INTO "User" (id, phone, role) VALUES (uuid, '+48TWOJNUMER', 'ADMIN')
- [ ] Admin stworzony
- [ ] Retool połączony z produkcyjną bazą

### TASK-066: Smoke test produkcji
- **Co:** Przejdź ręcznie kluczowy flow na produkcji.
- [ ] Klient: login OTP (prawdziwy SMS!) → profil → pojazd
- [ ] Klient: szukaj → (pusta lista — brak providerów)
- [ ] Provider: signup → NIP verify (prawdziwy GUS!) → upload → PENDING_APPROVAL
- [ ] Admin (Retool): approve provider
- [ ] Provider: login → dashboard → cennik → godziny → strefa
- [ ] Klient: szukaj → provider widoczny → rezerwuj → SMS do providera → provider accept → CONFIRMED (po wizycie klient płaci offline, v0 bez inline payments)

---

# FAZA 10: Onboarding providerów (tydzień 8–9)

### TASK-067: Onboarding 8 pilotażowych providerów
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

### TASK-068: Seed demand — pierwsi klienci
- **Co:** Wygeneruj pierwsze rezerwacje (bez nich providerzy odejdą).
- **Jak:** Patrz `analiza-biznesowa.md` sekcja 17.9.
- [ ] Friends & family: 20 SMS z kodem RODZINA
- [ ] Sam zarezerwuj u każdego z 8 providerów (test + seed)
- [ ] Grupy FB: post z kodem -30 zł
- [ ] Google Ads: kampania „wymiana opon nowy sącz" — 50 PLN/dzień × 14 dni
- [ ] Cel: 20+ rezerwacji w pierwszym tygodniu

---

# FAZA 11: Monitoring + Iteracja (tydzień 9+)

### TASK-069: Codzienny monitoring (pierwsze 2 tygodnie)
- **Codziennie 15 min:**
  - [ ] Sentry → nowe błędy? → jeśli critical → uruchom deva na fix
  - [ ] Retool dashboard → ile rezerwacji dziś? PENDING bez reakcji > 4h?
  - [ ] PostHog → funnel: ile wchodzi na stronę → ile rezerwuje? Gdzie drop?
  - [ ] Twilio logs → SMS-y dochodzą?

### TASK-070: Tygodniowy check-in z providerami
- **Co tydzień:**
  - [ ] Zadzwoń do 3 providerów: „Jak leci? Problemy?"
  - [ ] Zbierz feedback → zapisz w notatce
  - [ ] Jeśli bug → zgłoś → uruchom agenta na fix

### TASK-071: Decyzja po 2 tygodniach
- **Po 2 tyg od soft-launch oceń:**
  - [ ] Ile rezerwacji? (cel: > 20 w 2 tyg.)
  - [ ] Ile aktywnych providerów? (cel: > 5 z 8)
  - [ ] NPS prowiderów (zapytaj 1–10)
  - [ ] Critical bugi? Czy platforma jest stabilna?
  - **Jeśli OK:** → Public launch (TASK-072)
  - **Jeśli NIE:** → Iteracja (napraw bugi, dodaj feedback, spróbuj ponownie)

### TASK-072: Public launch
- [ ] Kampania marketingowa pełna (sekcja 17.8 w `analiza-biznesowa.md`)
- [ ] Kolejni providerzy (tier 2–3)
- [ ] Partnerstwa lokalne (myjnie, stacje)
- [ ] Monitoring weekly KPI

---

# Podsumowanie: 72 taski

| Faza | Taski | Twój czas |
|---|---:|---|
| 0. Przygotowanie (konta + env) | 22 | ~3–4h (jednorazowo) |
| 1. Sprint 0 (scaffold) | 6 | ~2h |
| 2. Sprint 1 (auth) | 11 | ~3–4h |
| 3. Sprint 2 (katalog) | 3 | ~2h |
| 4. Sprint 3 (rezerwacja) + GTM start | 5 | ~3h + GTM |
| 5. Sprint 4 (B2B) | 4 | ~3h |
| 6. Sprint 5 (oceny) | 2 | ~2h |
| 7. Sprint 6 (onboarding) | 3 + Retool | ~4h |
| 8. Sprint 7 (polish) | 4 | ~4h |
| 9. Deploy + soft-launch | 6 | ~full day |
| 10. Onboarding providerów | 2 | ~full week |
| 11. Monitoring + launch | 4 | ongoing |
| **RAZEM** | **72** | **~9 tygodni** |
