# Plan agentów AI — Opony.app

> Kto robi co, w jakiej kolejności, z jakimi narzędziami. 6 ról agentów, 138 SP MUST, 7 sprintów.

---

## 1. Model pracy

```
                    ┌──────────────────┐
                    │   ORKIESTRATOR   │  ← Ty (człowiek)
                    │  Decyzje, review │
                    │  merge, deploy   │
                    └────────┬─────────┘
                             │ przydziela zadania, reviewuje PR-y
          ┌──────────────────┼──────────────────────┐
          │                  │                      │
   ┌──────▼──────┐   ┌──────▼──────┐   ┌───────────▼──────┐
   │  ARCHITEKT  │   │ PROJEKTANT  │   │   TESTER (QA)    │
   │  (1 agent)  │   │  (1 agent)  │   │   (1 agent)      │
   └──────┬──────┘   └──────┬──────┘   └───────────┬──────┘
          │                  │                      │
          │ code review      │ design system        │ E2E, smoke
          │ schema review    │ UI review            │ cron tests
          │                  │                      │
   ┌──────▼──────────────────▼──────────────────────▼──────┐
   │                    DEVELOPERZY                         │
   │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
   │  │  BE dev  │  │  FE dev  │  │  FE dev  │  ...       │
   │  │ (backend)│  │ (klient) │  │  (B2B)   │            │
   │  └──────────┘  └──────────┘  └──────────┘            │
   └───────────────────────────────────────────────────────┘
```

**Przepływ pracy per sprint:**

1. **Orkiestrator** czyta plan sprintu (sekcja 20 w `plan-sprintow.md`) → uruchamia agentów
2. **Architekt** reviewuje schemat/API przed devami (Sprint 0 + początek każdego sprintu)
3. **Projektant** dostarcza design system + reviewuje UI po devach
4. **Developerzy** (BE + FE) budują kod równolegle (BE z testami, FE z MSW)
5. **Architekt** robi code review na PR-ach developerów
6. **Tester** pisze i uruchamia testy (E2E na końcu sprintu, smoke testy per sprint)
7. **Orkiestrator** merge'uje PR-y, odpala checklistę integracyjną, daje zielone światło

---

## 2. Role agentów

### 2.1. Orkiestrator (Ty — człowiek)

**Nie jest agentem AI** — to Ty. Podejmujesz decyzje, które agent AI nie powinien podejmować sam.

| Odpowiedzialność                                                               | Kiedy                                  |
| ------------------------------------------------------------------------------ | -------------------------------------- |
| Uruchamianie agentów z promptami z `plan-sprintow.md` sekcja 20                | Początek każdego sprintu               |
| Review i merge PR-ów do `main`                                                 | Po DoD agenta + code review Architekta |
| Uruchamianie checklisty integracyjnej                                          | Koniec każdego sprintu                 |
| Decyzje produktowe (scope change, priorytetyzacja)                             | Na bieżąco                             |
| Konfiguracja external services (Twilio, S3, Retool)                            | Sprint 0 + przed soft-launch           |
| Deploy na staging/produkcję                                                    | Po sprincie 7                          |
| GTM (outreach, onboarding providerów) — patrz `analiza-biznesowa.md` sekcja 17 | Równolegle od sprintu 3                |

**Narzędzia:** GitHub (PR review, merge), Railway dashboard, Vercel dashboard, Retool Cloud, terminal (pnpm commands).

---

### 2.2. Architekt (1 agent AI)

**Rola:** Strażnik jakości kodu i zgodności z architekturą. Nie pisze feature'ów — reviewuje i poprawia.

| Odpowiedzialność            | Input                            | Output                                                            |
| --------------------------- | -------------------------------- | ----------------------------------------------------------------- |
| **Code review** PR-ów BE/FE | PR diff + `architektura.md`      | Komentarze: co poprawić, approved/rejected                        |
| **Schema review**           | `schema.prisma` po migracjach BE | Zgodność z sekcją 8 (model danych), brakujące indeksy/constraints |
| **API review**              | Swagger `/v1/docs` po sprincie   | Zgodność z sekcją 9 (kontrakt API), brakujące endpointy           |
| **Security review**         | Cały codebase per sprint         | Rate limiting, injection, auth bypass, RODO                       |
| **Pattern enforcement**     | PR diff                          | Guards, DI, error handling (RFC 7807), naming conventions         |
| **Refactoring**             | Po sprincie, jeśli tech debt     | Cleanup, extract shared code, fix anti-patterns                   |

**Kiedy działa:**

- **Sprint 0:** Reviewuje scaffold (monorepo, Prisma config, CI/CD)
- **Sprint 1:** Reviewuje schemat Prisma (ALL tables) — krytyczne, bo to fundament
- **Sprint 2–7:** Code review KAŻDEGO PR-a przed merge
- **Po sprincie 7:** Security audit przed soft-launch

**Prompt template dla Architekta:**

```
Zrób code review PR-a [branch-name]. Sprawdź:
1. Zgodność z architekturą (architektura.md sekcje 5, 8, 9)
2. Wzorce NestJS: guards, DI, error handling RFC 7807
3. Prisma: poprawne relacje, indeksy, constraints
4. Security: rate limiting, input validation, auth guards
5. Testy: czy pokrywają happy path + edge cases
Zaakceptuj lub odrzuć z konkretnymi komentarzami.
```

---

### 2.3. Projektant / Designer (1 agent AI)

**Rola:** Buduje design system (ekstrakcja z gotowych HTML mockupów) i pilnuje spójności wizualnej. **Nie wymyśla UX — design phase zamknięty 2026-04-22, 38 ekranów w `/design` jest source of truth** (patrz ADR-008). Nie pisze logiki biznesowej.

| Odpowiedzialność                 | Input                                                                                            | Output                                                                                         |
| -------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| **Design System** (Sprint 0)     | Tokens z `/design/01-home.html :root` + komponenty z mockupów (card, chip, slot-pill, CTA, itp.) | `@opony/design-tokens` + 10 base komponentów w 2 flavors (native + web) + Storybook            |
| **UI review** FE PR-ów           | PR diff + odpowiedni ekran z `/design/*.html` (patrz tabela §12.Z plan-sprintow)                 | Komentarze: pixel-match do mockupu, a11y, responsiveness                                       |
| **Nowe komponenty** (na żądanie) | Opis + ekran w `/design/`                                                                        | Komponent w `@opony/design-system-{native,web}`                                                |
| **A11y audit**                   | Deployed app                                                                                     | Raport: brakujące ARIA, focus states, kontrast — baseline w footer `<caption>` każdego mockupu |
| **Responsive testing**           | Deployed app                                                                                     | Raport: broken layouts na mobile/tablet/desktop                                                |

**Kiedy działa:**

- **Sprint 0:** Buduje DS-0 — ekstrakcja tokenów + 10 base komponentów + Storybook (referencja: `/design/01-home.html` dla mobile, `/design/b2b-01-dashboard.html` dla desktop)
- **Sprint 1–6:** UI review PR-ów FE (po każdym FE PR) — sprawdza zgodność z konkretnym plikiem `.html` z `/design/` (nie wymyśla)
- **Sprint 7:** A11y audit + responsive audit przed soft-launch

**Prompt template dla Projektanta (Sprint 0):**

```
Stwórz /packages/design-tokens + /packages/design-system-{native,web} z 10 komponentami:
Button, Input, Badge, Card, Modal, BottomTabBar, SideMenu, Spinner, Toast, EmptyState.

TOKENS (source of truth):
- Wyciągnij z :root w /design/01-home.html (lines 17–47) — kolory, fonty, spacing, radius.
- Industrial-dark: graphite #0A0B0E + amber #FF6B1A, Bebas Neue / Archivo / JetBrains Mono.
- Wygeneruj 3 flavors: RN StyleSheet (native), CSS vars (web), Tailwind config (web).

KOMPONENTY (wzorce):
- Card: /design/01-home.html .card
- Chip: /design/01-home.html .chip
- Slot-pill: /design/18-home-brak-dostepnosci.html .slot (z white-space:nowrap)
- CTA: /design/03-time-slot.html .book-cta
- Input: /design/14-profil-setup.html .input-wrap

Semantic HTML + ARIA (patrz footer <caption> każdego mockupu). Storybook z jednym story per komponent.
Referencje: architektura.md §1 + §7 + ADR-008, plan-sprintow.md §12.Z.
```

**Prompt template dla Projektanta (UI review):**

```
Zrób UI review PR-a [branch-name]. Sprawdź pixel-match z konkretnym mockupem z /design/:
1. Znajdź plik w plan-sprintow.md §12.Z (tabela ekran↔US↔plik) odpowiadający ekranowi w PR.
2. Porównaj: spacing, radius, kolory, fonty, weighty — musi być identycznie.
3. Użycie komponentów z @opony/design-system-{native,web} (nie custom).
4. Responsywność: mobile 393px (referencja z phone mockups), tablet 768px, desktop 1440px (referencja z panel/landing).
5. A11y: semantic HTML, ARIA labels, focus states, kontrast WCAG AA — baseline w footer <caption> każdego mockupu.
6. Design tokens: zero hardcoded colors/spacing/fonts.
7. Stany: sprawdź czy PR pokrywa stany opisane w <caption> (hover, focus, disabled, error, empty).
```

---

### 2.4. Developer BE — Backend (wielu agentów AI)

**Rola:** Pisze moduły NestJS, migracje Prisma, integracje z external services. Jeden agent per task (BE-1a, BE-1b, BE-2, BE-3...).

| Odpowiedzialność                     | Input                                        | Output                                                    |
| ------------------------------------ | -------------------------------------------- | --------------------------------------------------------- |
| **NestJS modules**                   | Prompt z `plan-sprintow.md` sekcja 20        | Moduł: controller + service + dto + testy                 |
| **Prisma migrations** (schema owner) | `architektura.md` sekcja 8 (schemat)         | `schema.prisma` + migration                               |
| **External integrations**            | `architektura.md` sekcja 10 (integracje)     | Service: Twilio, S3, GUS, Resend (P24 w v0.5+ po ADR-004) |
| **Cron jobs**                        | `architektura.md` sekcja 9.9 (crony)         | `@Cron` decorated services                                |
| **Seed data**                        | Kontekst biznesowy (Nowy Sącz, 5 providerów) | `seed.ts`                                                 |
| **Unit testy**                       | Napisany kod                                 | Jest + supertest, min. 3–5 per moduł                      |

**Ile agentów BE per sprint:**

| Sprint | Agenty BE                                     | Co robią                                        |
| ------ | --------------------------------------------- | ----------------------------------------------- |
| 0      | INFRA-REPO, INFRA-DX                          | Scaffold, tooling                               |
| 1      | BE-1a (schema), BE-1b (auth), BE-2 (provider) | Fundament                                       |
| 2      | BE-3                                          | Katalog + availability                          |
| 3      | BE-4                                          | Booking + bookingExpiryCron (bez P24 — ADR-004) |
| 4      | BE-5                                          | Panel B2B + S3 upload                           |
| 5      | BE-6                                          | Reviews + settlement + refund                   |
| 6      | BE-7                                          | Upload + admin + crony                          |
| 7      | BE-8a (features), BE-8b (crony)               | Polish + systemowe                              |

**Reguły:**

- **Schema owner** pisze migracje Prisma — JEDEN per sprint (patrz sekcja 20 w `plan-sprintow.md`)
- Każdy agent na osobnym branchu `sprint-X/be-Y`
- Testy MUSZĄ przechodzić przed PR
- Swagger `/v1/docs` aktualizowany po każdym agentu
- **Każdy nowy endpoint MUSI mieć `@ApiResponse({ type: XxxResponseDto })`** — patrz `architektura.md §9.A`. Bez tego typy odpowiedzi nie trafią do schematu FE i frontend nie może być typowany.
- **Każdy nowy moduł MUSI mieć plik `src/<modul>/dto/<modul>-response.dto.ts`** — klasa z `@ApiProperty` na każdym polu, `!` na wymaganych właściwościach, `nullable: true` na polach `| null`

---

### 2.5. Developer FE — Frontend (3 warianty agenta per target)

Frontend po zmianie architektury (ADR-001) ma 3 różne targety — każdy wymaga innego stacku i innego agenta:

**2.5.a. FE-mobile** (`apps/mobile` — Expo + React Native Web)

- **Stack:** Expo SDK 50+, expo-router, React Native, react-native-web, Zustand, React Hook Form + Zod, @tanstack/react-query
- **Design system:** `@opony/design-system-native` (RN StyleSheet, Flexbox-only)
- **Design reference:** `/design/01-*.html` do `/design/21-*.html` (21 ekranów mobile, phone 393×852) — pełna mapa w [`plan-sprintow.md §12.Z A`](plan-sprintow.md#12z-pełny-zakres-design-phase--38-ekranów). Kluczowe pliki per zadanie poniżej.
- **Scope v0:** wszystkie ekrany klienta (Home/Search, Booking, Profile, Reviews, Ratings, Map) — **bez Payment** (ADR-004) + empty states + offline + PWA install + error boundary
- **Scope v0.5+:** provider features w tej samej apce (Dashboard dnia, accept PENDING) za guard `role=PROVIDER`
- **Zadania:**
  - FE-mobile-1 (auth+profile) — `08-auth-phone.html`, `09-auth-otp.html`, `10-auth-consent.html`, `07-profile.html`, `14-profil-setup.html`, `15-dodaj-pojazd.html`
  - FE-mobile-2 (search+catalog) — `01-home.html`, `02-provider-detail.html`, `17-home-brak-pojazdu.html`, `18-home-brak-dostepnosci.html`, `16-empty-waitlist.html`
  - FE-mobile-3 (booking flow — bez payment) — `03-time-slot.html`, `04-booking-confirmed.html`
  - FE-mobile-4 (bookings list) — `05-my-bookings.html`, `06-booking-detail.html`
  - FE-mobile-5 (reviews+rating) — `12-rate-visit.html`, `13-reviews.html`
  - FE-mobile-6 (map view) — `11-map.html`
  - FE-mobile-7 (polish) — `19-offline-state.html`, `20-pwa-install.html`, `21-error-boundary.html`

**2.5.b. FE-panel** (`apps/panel` — Next.js 14 App Router, desktop-first, `panel.opony.app`)

- **Stack:** Next.js 14+ App Router, React Context, React Hook Form + Zod, MSW
- **Design system:** `@opony/design-system-web` (CSS/Tailwind)
- **Design reference:** `/design/b2b-*.html` (14 ekranów, desktop 1440×900) — pełna mapa w [`plan-sprintow.md §12.Z B`](plan-sprintow.md#12z-pełny-zakres-design-phase--38-ekranów). Kluczowe pliki per zadanie poniżej.
- **Reguła:** zero booking-flow w przeglądarce (ADR-008) — tylko „Rezerwacja ręczna" w b2b-13 jako wyjątek dla providera zgłaszającego wizytę telefoniczną.
- **Scope v0:** wszystkie ekrany providera — login OTP, onboarding wizard 3 kroki, PENDING blockade, dashboard dnia, kalendarz, lista rezerwacji, szczegół, cennik, godziny, strefa, profil warsztatu, opinie, ustawienia konta
- **Zadania:**
  - FE-panel-1 (auth+wizard) — `b2b-12-login.html`, `b2b-02-onboarding-firma.html`, `b2b-03-onboarding-zdjecia.html`, `b2b-04-onboarding-weryfikacja.html`
  - FE-panel-2 (dashboard+bookings) — `b2b-01-dashboard.html`, `b2b-09-kalendarz.html`, `b2b-13-rezerwacje.html`, `b2b-08-szczegol-rezerwacji.html`
  - FE-panel-3 (firma) — `b2b-05-cennik.html`, `b2b-06-godziny.html`, `b2b-07-strefa.html`, `b2b-11-profil.html`
  - FE-panel-4 (opinie+ustawienia) — `b2b-10-opinie.html`, `b2b-14-ustawienia.html`

**2.5.c. FE-landing** (`apps/landing` — Next.js 14 Static Export, `opony.app`)

- **Stack:** Next.js 14+ Static Export, SEO meta tags, Schema.org structured data
- **Design system:** `@opony/design-system-web`
- **Design reference:** `/design/landing-*.html` (3 ekrany) — pełna mapa w [`plan-sprintow.md §12.Z C`](plan-sprintow.md#12z-pełny-zakres-design-phase--38-ekranów).
- **Reguła:** zero booking-flow w przeglądarce (ADR-008) — CTA „Otwórz w aplikacji" (Universal Links + QR code dla desktop) jako zamiennik rezerwacji online.
- **Scope v0:** `/` (landing-01-home), `/p/<slug>` (landing-02 publiczny profil z SSR+OG dla US-42), `/nowy-sacz` (landing-03 SEO long-tail listing), `/regulamin`, `/polityka-prywatnosci`, formularz waitlist → POST /v1/waitlist
- **Zadania:**
  - FE-landing-1 (całość) — `landing-01-home.html`, `landing-02-profil-publiczny.html`, `landing-03-miasto.html`

**Dlaczego osobni agenci** (nie jeden „universal FE"): różny stack (RN vs DOM) i różny design-system wymagają różnych skillów i patternów. Jeden agent miesza StyleSheet z CSS, używa `<div>` w RN kod, lub `<View>` w Next.js. Split redukuje ryzyko review rejections.

**Rola wspólna:** Pisze UI (Expo lub Next.js), integrację z API przez `@opony/api-client`, testy komponentów.

| Odpowiedzialność                     | Input                                   | Output                         |
| ------------------------------------ | --------------------------------------- | ------------------------------ |
| **Next.js pages**                    | Wireframy (12.x) + prompt z sekcji 20   | `app/` pages + components      |
| **MSW handlers** (dzień 1–2)         | Kontrakt API (architektura.md sekcja 9) | `/mocks/handlers/*.ts`         |
| **Real API integration** (dzień 3–5) | Gotowe API z BE                         | Swap MSW → `@opony/api-client` |
| **Formularze**                       | Wireframy + walidacja                   | React Hook Form + Zod          |
| **Mapy**                             | Wireframe 12.13, 12.7                   | Google Maps JS API components  |

**Ile agentów FE per sprint:**

| Sprint | Agenty FE                                                 | Co robią                           |
| ------ | --------------------------------------------------------- | ---------------------------------- |
| 0      | DS-0                                                      | Design system (10 komponentów)     |
| 1      | FE-mobile-1 (klient auth+profil), FE-panel-1 (B2B wizard) | Login, profil, onboarding          |
| 2      | FE-mobile-2 (search+catalog), FE-mobile-6 (mapa)          | Lista + mapa + filtry              |
| 3      | FE-mobile-3 (booking flow)                                | Booking flow bez payment (ADR-004) |
| 4      | FE-5a (dashboard), FE-5b (CRUD)                           | Panel B2B                          |
| 5      | FE-6a (profil+oceny), FE-6b (B2B opinie+finanse)          | Oceny + rozliczenia                |
| 6      | FE-7a (rezerwacje klient), FE-7b (onboarding wizard)      | Historia + onboarding              |
| 7      | FE-8                                                      | Szczegół rez B2B + manual booking  |

**Reguły:**

- **Start z MSW od dnia 1** — nie czekaj na BE
- Używaj TYLKO komponentów z `@opony/design-system`
- Formularze: React Hook Form + Zod (walidacja identyczna z BE)
- API calls: `@opony/api-client` (typed fetch z OpenAPI)
- **Typy odpowiedzi NIGDY nie są definiowane ręcznie** — zawsze aliasy do `components['schemas']['XxxResponseDto']` z wygenerowanego schematu. Patrz `architektura.md §9.A`.
- **Przed startem pracy z nowym modułem** uruchom `pnpm generate:api-client` (wymaga działającego BE lokalnie), żeby schema.d.ts był aktualny.
- **Warstwa dostępu do API** żyje w `api-data-access/` (jeden plik per kontroler BE), **nie** w page.tsx / komponentach. Patrz `architektura.md §9.A.4`.
- **`npx tsc --noEmit` musi przechodzić** bez błędów przed PR.

---

### 2.6. Tester / QA (1 agent AI)

**Rola:** Pisze testy automatyczne i weryfikuje jakość. Działa głównie w sprincie 7, ale smoke testy per sprint.

| Odpowiedzialność             | Input                                         | Output                            |
| ---------------------------- | --------------------------------------------- | --------------------------------- |
| **E2E testy** (Playwright)   | Wireframy + flow z sekcji 4 (architektura.md) | `e2e/tests/*.spec.ts`             |
| **Cron testy**               | Sekcja 9.9 (crony)                            | `e2e/cron-tests/*.sh`             |
| **Smoke testy** (per sprint) | Checklista integracyjna z sekcji 20           | Pass/fail raport                  |
| **Performance test**         | Deployed app                                  | Lighthouse score, p95 API latency |
| **Security scan**            | Deployed app + codebase                       | OWASP top 10, dependency audit    |

**Kiedy działa:**

| Sprint     | Co robi Tester                                                                   |
| ---------- | -------------------------------------------------------------------------------- |
| 0–6        | Smoke test po każdym sprincie (5–10 min, checklista z sekcji 20)                 |
| 7          | **Główna faza:** E2E (3 flow), cron testy (4 scenariusze), performance, security |
| Pre-launch | Final regression + load test (opcjonalny)                                        |

**Prompt template (Sprint 7):**

```
Napisz Playwright E2E testy dla 3 flow:
1. Klient: login OTP → szukaj → rezerwuj → potwierdzenie PENDING → provider accept → CONFIRMED (bez P24 — ADR-004)
2. Provider: login OTP → dashboard → akceptuj → rozpocznij → zakończ
3. Onboarding: signup → NIP → upload → (admin approve) → login → dashboard
Użyj seed data z BE-1a. Mock: Twilio (intercept). P24 nie dotyczy v0 (ADR-004).
Osobno: bash skrypty testujące crony (NO_SHOW, bookingExpiry, rating).
```

---

## 3. Workflow per sprint

```
Dzień 1                    Dzień 2-3                  Dzień 4-5
─────────────────────────────────────────────────────────────────
Orkiestrator               Orkiestrator               Orkiestrator
 │ uruchamia agentów        │                          │ checklista
 ▼                          ▼                          ▼ integracyjna
┌─────────┐  ┌─────────┐  ┌─────────┐               ┌─────────┐
│ BE dev  │  │ FE dev  │  │ FE swap │               │ Tester  │
│ (API)   │  │ (MSW)   │  │ (real)  │               │ (smoke) │
└────┬────┘  └────┬────┘  └────┬────┘               └────┬────┘
     │            │            │                          │
     ▼            ▼            ▼                          ▼
┌─────────┐  ┌─────────┐  ┌─────────┐               ┌─────────┐
│Architekt│  │Projektant│ │Architekt│               │  MERGE  │
│(schema  │  │(UI      │  │(code   │               │  to     │
│ review) │  │ review) │  │ review)│               │  main   │
└─────────┘  └─────────┘  └─────────┘               └─────────┘
```

**Szczegółowo:**

| Dzień         | Kto                   | Co robi                                                  |
| ------------- | --------------------- | -------------------------------------------------------- |
| **1 rano**    | Orkiestrator          | Kopiuje prompt z sekcji 20 → uruchamia BE dev + FE dev   |
| **1**         | BE dev (schema owner) | Pisze migracje + API endpoints + testy                   |
| **1**         | FE dev                | Pisze UI z MSW mockami (własne handlery z kontraktu API) |
| **1 wieczór** | Architekt             | Reviewuje schemat BE dev (jesli schema owner)            |
| **2–3**       | BE dev                | Kończy API, pushuje PR                                   |
| **2–3**       | FE dev                | Kończy UI z MSW, pushuje PR                              |
| **2–3**       | Architekt             | Code review obu PR-ów                                    |
| **2–3**       | Projektant            | UI review FE PR-a                                        |
| **3–4**       | FE dev                | Swap MSW → real API, fixuje integrację                   |
| **4–5**       | Orkiestrator          | Merge PR-ów do `main` po approvalach                     |
| **5**         | Tester                | Smoke test (checklista integracyjna sprintu)             |
| **5**         | Orkiestrator          | Zielone światło → następny sprint                        |

---

## 4. Narzędzia per rola

| Rola             | Narzędzia AI                        | Pliki referencyjne                            |
| ---------------- | ----------------------------------- | --------------------------------------------- |
| **Orkiestrator** | Claude Code (CLI), GitHub, terminal | `plan-sprintow.md` sekcja 20 (prompty)        |
| **Architekt**    | Claude Code z kontekstem repo       | `architektura.md` (cały plik)                 |
| **Projektant**   | Claude Code + Storybook             | `architektura.md` sekcja 7, wireframy 12.x    |
| **Developer BE** | Claude Code (worktree isolation)    | `architektura.md` sekcje 5, 8, 9, 10          |
| **Developer FE** | Claude Code (worktree isolation)    | wireframy 12.x, `architektura.md` sekcje 7, 9 |
| **Tester**       | Claude Code + Playwright            | `architektura.md` sekcja 9, wireframy         |

---

## 5. Quality gates (bramki jakości)

Kod przechodzi przez 3 bramki zanim trafi do `main`:

### Gate 1: DoD agenta (self-check)

Agent sam weryfikuje przed PR:

- [ ] `pnpm build` — zero errors
- [ ] `pnpm test` — zero failures
- [ ] Swagger updated (BE) / Storybook updated (design system)
- [ ] Nowe env vars dodane do `.env.example`

### Gate 2: Review (Architekt + Projektant)

| Kto        | Co sprawdza                                             |
| ---------- | ------------------------------------------------------- |
| Architekt  | Architektura, wzorce, security, testy, API contract     |
| Projektant | UI zgodny z wireframem, a11y, responsive, design tokens |

Jeśli rejected → agent dostaje feedback i poprawia (max 2 retry).

### Gate 3: Integracja (Orkiestrator + Tester)

Po merge do `main`:

- [ ] Checklista integracyjna sprintu (sekcja 20)
- [ ] Smoke test kluczowego flow
- [ ] Seed data rozszerzony i działa

---

## 6. Harmonogram agentów per sprint

> **ADR-009 B2B-first reorder (2026-04-22):** Sprint 1-3 = Faza A (provider portal LIVE → Milestone A). Sprint 4-6 = Faza B (klient z realnymi danymi 8 pilotów → Milestone B). Szczegóły w [`plan-sprintow.md §20`](../docs/plan-sprintow.md#20-plan-sprintów-dla-agentów-ai) + [`checklist-orkiestratora.md`](../docs/checklist-orkiestratora.md).

| Sprint            | Orkiestrator                                                            | Architekt                                     | Projektant                                | Dev BE                                                     | Dev FE                                                                                                                     | Tester               |
| ----------------- | ----------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **0**             | Setup repo, env                                                         | Review scaffold                               | **DS-0** (ekstrakcja tokenów z `/design`) | INFRA-REPO, INFRA-DX                                       | —                                                                                                                          | —                    |
| **1 · Faza A**    | 4 agenty + Retool admin                                                 | Review schema (ALL tables!)                   | UI review FE-panel-1                      | BE-1a, BE-1b (shared OTP + provider onboarding + GUS + S3) | FE-panel-1 (login b2b-12 + wizard b2b-02/03/04)                                                                            | Smoke                |
| **2 · Faza A**    | 3 agenty                                                                | Code review (2-step OTP, soft-delete)         | UI review FE-panel-2, FE-panel-3          | BE-2 (pricing/schedule/zone/photos/profile/settings)       | FE-panel-2 (cennik/godziny/strefa), FE-panel-3 (profil/ustawienia)                                                         | Smoke                |
| **3 · Faza A**    | 5 agentów + Retool-2                                                    | Code review (state machine booking KRYTYCZNE) | UI review FE-panel-4/5 + FE-landing-1a    | BE-3 (Booking + manual + state machine + CSV)              | FE-panel-4 (dashboard/kalendarz/lista/szczegół), FE-panel-5 (opinie + b2b-15 waiting), FE-landing-1a (landing provider v1) | Smoke                |
| **★ MILESTONE A** | **Onboard 2-3 pilotów + GTM start + decision gate (iterate vs Faza B)** |                                               |                                           |                                                            |                                                                                                                            |                      |
| **4 · Faza B**    | 3 agenty                                                                | Code review (haversine, availability)         | UI review FE-mobile-1, FE-mobile-2        | BE-4 (client auth reuse + vehicle + catalog + waitlist)    | FE-mobile-1 (auth 08-10 + onboarding 14-15 + profil 07), FE-mobile-2 (home 01 + detail 02 + map 11 + empty 16-18)          | Smoke                |
| **5 · Faza B**    | 3 agenty                                                                | Code review (409 race, idempotency)           | UI review FE-mobile-3                     | BE-5 (POST /bookings + slot lock)                          | FE-mobile-3 (booking flow 03-06), FE-panel-6 (PENDING refinement)                                                          | Smoke                |
| **6 · Faza B**    | 4 agenty                                                                | Code review (review filter, cron)             | UI review FE-mobile-4/5 + FE-landing-2    | BE-6 (review + 2 crony)                                    | FE-mobile-4 (rate 12 + reviews 13), FE-mobile-5 (polish 19-21), FE-landing-2 (client pivot + /p/slug + /nowy-sacz)         | Smoke                |
| **★ MILESTONE B** | **Full marketplace LIVE · F&F testing → soft launch gate**              |                                               |                                           |                                                            |                                                                                                                            |                      |
| **7**             | Final review                                                            | **Security audit**                            | **A11y audit**                            | BE-8a, BE-8b                                               | FE-8 (polish + manual booking refinement)                                                                                  | **QA-E2E + QA-CRON** |

---

## 7. Ile agentów potrzebujesz

**Minimum (sekwencyjne pary):** 4 agenty jednocześnie

- 1 × Architekt (review)
- 1 × BE dev
- 1 × FE dev
- 1 × Projektant/Tester (dzielony)

**Optimum (pełna równoległość):** 7 agentów jednocześnie

- 1 × Architekt
- 1 × Projektant
- 2 × BE dev (Sprint 1: BE-1a + BE-1b równolegle z BE-2)
- 3 × FE dev (FE-mobile + FE-panel + FE-landing — różne stacki, różne pakiety design-system, nie mieszać w jednym agencie)

**W praktyce:** nie potrzebujesz 6 stałych agentów. Uruchamiasz tyle, ile wymaga sprint:

| Sprint |                                                                 Jednoczesnych agentów |
| -----: | ------------------------------------------------------------------------------------: |
|      0 |                                                      3 (INFRA-REPO + INFRA-DX + DS-0) |
|      1 | 6 (BE-1a → BE-1b + BE-2 + FE-mobile-1 + FE-panel-1 + FE-landing-1) + Architekt review |
|      2 |                                                               2 + review (BE-3, FE-3) |
|      3 |                                                               2 + review (BE-4, FE-4) |
|      4 |                                                       3 + review (BE-5, FE-5a, FE-5b) |
|      5 |                                                       3 + review (BE-6, FE-6a, FE-6b) |
|      6 |                                      3 + review + Retool (human) (BE-7, FE-7a, FE-7b) |
|      7 |                                      5 + review (BE-8a, BE-8b, FE-8, QA-E2E, QA-CRON) |

**Peak: 5 coding agents + 1 Architekt + 1 Projektant = 7 jednoczesnych** (Sprint 1 i 7).

---

## 8. Jak uruchomić agenta (instrukcja dla Orkiestratora)

### Krok 1: Otwórz plan sprintu

Przeczytaj sekcję 20 w `plan-sprintow.md` → znajdź odpowiedni sprint → skopiuj prompt agenta.

### Krok 2: Uruchom agenta developerskiego

```
Prompt dla agenta = prompt z sekcji 20 + kontekst:
"Pracujesz w monorepo opony/. Branch: sprint-X/agent-name.
Dokumentacja: docs/architektura.md (stack, schema, API).
Wireframy: docs/plan-sprintow.md sekcja 12.
[wklej prompt z sekcji 20]"
```

### Krok 3: Uruchom Architekta na review

```
"Zrób code review PR-a sprint-X/agent-name.
Referencje: docs/architektura.md.
Sprawdź: architektura, wzorce, security, testy, API contract.
Zaakceptuj lub odrzuć z komentarzami."
```

### Krok 4: Uruchom Projektanta na UI review (dla FE PR-ów)

```
"Zrób UI review PR-a sprint-X/fe-Y.
Wireframy: docs/plan-sprintow.md sekcja 12.X.
Sprawdź: pixel-perfect, a11y, responsive, design tokens, @opony/design-system."
```

### Krok 5: Merge + smoke test

Po approvalach → merge do `main` → uruchom checklistę integracyjną.

---

## 9. Eskalacja i troubleshooting

| Sytuacja                                               | Kto reaguje                                    | Akcja                                |
| ------------------------------------------------------ | ---------------------------------------------- | ------------------------------------ |
| Agent nie osiąga DoD po 2 retry                        | Orkiestrator                                   | Human review + manual fix            |
| Merge conflict                                         | Schema owner merge'uje pierwszy, reszta rebase | Architekt asystuje                   |
| Failing testy po merge                                 | Tester identyfikuje, Dev fixuje                | Hotfix branch                        |
| External service nie działa (Twilio, GUS, Google Maps) | Orkiestrator                                   | Mock w dev, fix credentials          |
| Scope creep (agent dodaje nieproszone feature)         | Architekt                                      | Reject PR, przypomnij scope          |
| Performance issue                                      | Tester                                         | Profiling, Architekt rekomenduje fix |
