# Checklist Orkiestratora — szczegółowe taski

> Każdy task to JEDNO konkretne działanie. Opis mówi CO zrobić, JAK i jaki jest OCZEKIWANY REZULTAT. Rób po kolei od góry.

---

# FAZA 0: Przygotowanie (przed kodowaniem)

## 0.1. Konta zewnętrzne — długi lead time (zacznij natychmiast!)

### TASK-001: Kup domenę
- **Co:** Kup domenę `opony.app` (lub alternatywę np. `opony.pl`, `oponyapp.pl`)
- **Jak:** Rejestracja u rejestratora (OVH, Cloudflare, nazwa.pl). Wybierz z DNS management.
- **Czas:** 10 min
- **Rezultat:** Domena aktywna, dostęp do panelu DNS
- [ ] Zrobione

### TASK-002: Załóż konto Przelewy24 + weryfikacja firmy
- **Co:** Rejestracja konta merchant w Przelewy24. Wymaga NIP firmy (JDG lub Sp. z o.o.).
- **Jak:** Formularz na stronie P24 → wpisz dane firmy → wyślij → czekaj na weryfikację.
- **Czas:** 10 min na formularz, **3–5 dni roboczych** na weryfikację (dlatego TERAZ!)
- **Rezultat:** `P24_MERCHANT_ID`, `P24_API_KEY`, `P24_CRC` w panelu P24. Dostęp do sandbox `sandbox.przelewy24.pl`.
- **⚠ Blocker:** Bez tego nie przetestujesz płatności w Sprint 3!
- [ ] Formularz wysłany
- [ ] Weryfikacja zakończona
- [ ] Credentials zapisane bezpiecznie (password manager)

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
- **Co:** Hosting dla 3 aplikacji Next.js (client, provider, landing).
- **Jak:** Vercel.com → Sign up with GitHub → Import project `opony` (po push kodu w Sprint 0). Na razie tylko konto.
- **Czas:** 5 min
- **Rezultat:** Konto Vercel połączone z GitHub
- [ ] Konto aktywne

### TASK-008: Załóż konto Resend + weryfikacja domeny
- **Co:** Serwis email transakcyjny (potwierdzenia, reset, raporty).
- **Jak:** (1) Resend.com → Sign up → (2) Settings → Domains → Add domain `opony.app` → (3) Dodaj 3 rekordy DNS (SPF, DKIM, DMARC) w panelu rejestratora domeny → (4) Kliknij „Verify" w Resend.
- **Czas:** 15 min + czekanie na propagację DNS (do 24h, zwykle 10 min)
- **Rezultat:** `RESEND_API_KEY`, domena zweryfikowana (status: Verified)
- [ ] Konto założone
- [ ] Rekordy DNS dodane
- [ ] Domena zweryfikowana

### TASK-009: Załóż konto Sentry + 3 projekty
- **Co:** Monitoring błędów dla API, client PWA, provider web.
- **Jak:** Sentry.io → Sign up → Create organization `opony` → Create 3 projects: (1) `opony-api` platform Node.js (2) `opony-client` platform Next.js (3) `opony-provider` platform Next.js.
- **Czas:** 10 min
- **Rezultat:** 3 × `SENTRY_DSN` (jeden per projekt)
- [ ] 3 projekty stworzone
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

---

## 0.4. Przygotuj plik z credentials

### TASK-022: Stwórz lokalny plik z wszystkimi credentials
- **Co:** Zbierz wszystkie klucze API z TASKów 002–013 w jedno bezpieczne miejsce.
- **Jak:** Stwórz plik `credentials-local.md` (NIE commituj do repo!) lub użyj password managera. Zapisz:
  ```
  P24_MERCHANT_ID=...
  P24_API_KEY=...
  P24_CRC=...
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
- **Co:** 10 base komponentów + Storybook.
- **Jak:** Wklej prompt DS-0. Może pracować równolegle z INFRA-DX (oddzielny branch!).
- **Czas:** 20–30 min
- **Rezultat:** `/packages/design-system/` z 10 komponentami, Storybook
- **Weryfikacja:** `pnpm storybook` → otwórz browser → 10 komponentów widocznych
- [ ] Agent uruchomiony
- [ ] Storybook działa

### TASK-027: Uzupełnij .env.local z credentials
- **Co:** Wklej prawdziwe credentials do `.env.local` (z TASK-022).
- **Jak:** `cp .env.example .env.local` → otwórz → wklej wartości z TASK-022. Na razie placeholder'y dla P24/Twilio (jeśli weryfikacja trwa) — `NEXT_PUBLIC_API_MOCK=true` pozwoli FE pracować bez nich.
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

### TASK-043: Sprawdź status P24 i Twilio
- **Co:** Upewnij się, że credentials z TASK-002 i TASK-003 są gotowe.
- **Jak:** Zaloguj się do panelu P24 → sandbox aktywny? Zaloguj się do Twilio → SMS wysyłany?
- **⚠** Jeśli P24 jeszcze nie gotowe → agent BE-4 użyje mocka. Ale testy na real sandbox będą niemożliwe.
- [ ] P24 sandbox aktywny
- [ ] Twilio SMS działa (wyślij testowy na swój numer)

### TASK-044: Uruchom Agent BE-4 (Booking + P24)
- **Co:** Moduł rezerwacji z integracją Przelewy24 + cron paymentTimeout.
- **Jak:** Branch `sprint-3/be-4-booking`. Prompt BE-4 z sekcji 20.
- **Weryfikacja:** Swagger → `POST /v1/bookings` → zwraca `{booking, paymentUrl}`
- [ ] Uruchomiony + zweryfikowany

### TASK-045: Uruchom Agent FE-4 (Booking flow + Payment)
- **Co:** Flow rezerwacji klienta: wybór slotu → płatność → potwierdzenie.
- **Jak:** Branch `sprint-3/fe-4-booking`. Prompt FE-4.
- **Weryfikacja:** `localhost:3000` → provider → slot → „Zapłać" → redirect → potwierdzenie
- [ ] Uruchomiony + zweryfikowany

### TASK-046: Review + merge Sprint 3
- [ ] Architekt: review BE-4 (**P24 integracja — KRYTYCZNE!** sprawdź webhook verification, idempotency, race condition)
- [ ] Projektant: UI review FE-4 (wireframy 12.2, 12.3, 12.8, 12.4)
- [ ] Swap MSW → real
- [ ] Merge do main
- **Checklista Sprint 3:**
  - [ ] Szukaj → provider → slot → zapłać (P24 sandbox) → SMS → potwierdzenie
  - [ ] Double-booking: 2 okna → 1 sukces, 1 × 409
  - [ ] Adres poza strefą → inline error
  - [ ] Payment timeout: czekaj 15 min → slot zwolniony

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
- [ ] Architekt: review BE-6 (settlement + refund P24)
- [ ] Projektant: UI review FE-6a + FE-6b (wireframy 12.2, 12.12, 12.17, 12.14)
- [ ] Swap + merge
- **Checklista Sprint 5:**
  - [ ] Ocena po COMPLETED → widoczna w profilu
  - [ ] Provider odpowiada na opinię
  - [ ] Settlement obliczony po COMPLETED
  - [ ] Refund: anuluj > 2h → P24 refund

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
  - [ ] Crony: NO_SHOW ✓, paymentTimeout ✓, weeklyPayouts ✓, ratingCache ✓
  - [ ] Lighthouse PWA > 80
  - [ ] p95 API < 300 ms
  - [ ] `npm audit` — zero critical

---

# FAZA 9: Deploy + Soft-launch (tydzień 8)

### TASK-061: Zamień credentials na produkcyjne
- **Co:** Podmień sandbox → prod dla P24, Twilio, S3, Resend.
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
- **Co:** Podepnij domenę.
- **Jak:** W panelu rejestratora: (1) `opony.app` → CNAME → Vercel (landing) (2) `client.opony.app` → CNAME → Vercel (3) `provider.opony.app` → CNAME → Vercel (4) `api.opony.app` → CNAME → Railway
- [ ] DNS skonfigurowany
- [ ] SSL automatyczny (Vercel + Railway)
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
- [ ] Klient: szukaj → provider widoczny → rezerwuj → zapłać (prawdziwy BLIK!) → SMS

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
