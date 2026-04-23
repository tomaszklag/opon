Tak — najsensowniej zacząć od Sprint 0 scaffold (1-2 dni, fundament), potem dopiero Sprint 1 BE/FE panelu. Bez
scaffoldu nie ma gdzie pisać provider code.

Niżej master prompt + pierwszy agent prompt (TASK-023 INFRA-REPO). Kolejne prompty wygenerujemy po review
każdego kroku — iteracyjnie.

---

A. Master prompt dla Orkiestratora (Ty)

Wklej to do nowej instancji Claude Code zanim odpalisz pierwszego agenta — buduje kontekst dla Twojej sesji
orkiestrującej.

Jestem orkiestratorem projektu Opony.app — marketplace wulkanizacji, pilot w Nowym Sączu.

KONTEKST PROJEKTU (przeczytaj zanim zaczniemy):

1. `analiza.md` — overview projektu
2. `docs/architektura.md` §11 — ADR-ów (zwłaszcza ADR-001 3 artefakty, ADR-004 bez płatności v0, ADR-009
   B2B-first)
3. `docs/plan-sprintow.md` §7 (fazy) + §20 (sprinty z promptami agentów)
4. `docs/checklist-orkiestratora.md` — moja TODO lista (aktualnie przed TASK-023)
5. `docs/plan-agentow.md` — role i workflow
6. `/design/` — 39 ekranów HTML (source of truth UI)

STAN PROJEKTU:

- Design phase zamknięta 2026-04-22 (39 ekranów)
- Docs zsynchronizowane z ADR-009 (B2B-first sequencing — 2026-04-22)
- Implementation START: dziś
- Sprint 0 (scaffold) → Sprint 1-3 (Faza A: provider portal) → Sprint 4-6 (Faza B: klient) → Sprint 7 (soft
  launch)

REGUŁY ARCHITEKTURALNE (utrwalone):

1. Zero booking-flow w landing/panel — booking wyłącznie w app.opony.app
2. Miasto pilot = Nowy Sącz (nie Poznań)
3. Zero płatności w v0 (ADR-004)
4. B2B-first implementacja (ADR-009) — provider portal LIVE przed klientem

ZASADY WSPÓŁPRACY:

- Pracujemy iteracyjnie — jedno zadanie na turę, potem STOP i czekam na review/feedback
- Agenci AI nie wymyślają UX — ekrany w /design to source of truth (prompty agentów wskazują konkretne pliki
  .html)
- Każdy agent otwiera SWÓJ branch, merge dopiero po review przez Architekta + Projektanta
- Schema Owner merge'uje PIERWSZY (BE-1a w Sprint 1), reszta rebase'uje

MOJA ROLA:

- Uruchamiam agentów w kolejności z checklist-orkiestratora.md
- Przekazuję promptу z plan-sprintow.md §20
- Robię review PR-ów (lub odpalam Architekta/Projektanta do review)
- Merge po akceptacji
- Weryfikuję Gate 3 (checklista integracyjna sprintu)

Zacznijmy od TASK-023 — przygotuj mi prompt dla Agenta INFRA-REPO.

---

B. Prompt dla Agenta INFRA-REPO (TASK-023 — pierwszy agent)

Wklej to do nowej instancji Claude Code w świeżym folderze projektu (repo jeszcze nie istnieje, założysz je w
tym tasku). Agent ma jedno zadanie: scaffold monorepo.

# ROLA

Jesteś agentem INFRA-REPO — backend/infra developer. Twoje zadanie: scaffold monorepo dla projektu Opony.app.
NIE piszesz logiki biznesowej, NIE implementujesz ekranów. Tylko struktura + konfiguracja.

# KONTEKST PROJEKTU

- Projekt: Opony.app (marketplace wulkanizacji, pilot Nowy Sącz)
- Stack (ADR-001): Expo + RNW (klient mobile+web), Next.js 14 (panel + landing), NestJS (API), Prisma +
  Postgres 16, Turborepo + pnpm
- Przeczytaj najpierw: `docs/architektura.md` sekcje §1 (stack), §3 (struktura monorepo), §4 (setup guide)
- Pełne prompty agentów: `docs/plan-sprintow.md` §20 — Sprint 0 — INFRA-REPO

# ZADANIE (TASK-023)

Stwórz pełną strukturę monorepo zgodnie z `architektura.md` §3:

```
/apps/api/          — NestJS 10 + Prisma 5 (Node 20+)
/apps/mobile/       — Expo SDK 50+ + React Native Web (expo-router)
/apps/panel/        — Next.js 14 App Router (desktop-first)
/apps/landing/      — Next.js 14 Static Export
/packages/
  design-tokens/    — JSON source of truth (puste, wypełnia DS-0 w TASK-026)
  design-system-native/  — RN StyleSheet (puste)
  design-system-web/     — CSS/Tailwind (puste)
  shared-types/     — TS types + enums
  api-client/       — typed fetch z OpenAPI
/e2e/               — Playwright (puste, wypełnia QA w Sprint 7)
/.github/workflows/ — CI pipeline
```

Konfiguracja:

- `package.json` root z workspaces (pnpm)
- `turbo.json` z pipeline'ami (build, dev, test, lint)
- `pnpm-workspace.yaml`
- `.nvmrc` (Node 20)
- `.gitignore` (standard Node + wygenerowane pliki)
- `.env.example` z placeholderami per `architektura.md §4` (DATABASE*URL, JWT_SECRET, TWILIO*\_, AWS\_\_,
  RESEND_API_KEY, SENTRY_DSN, GOOGLE_MAPS_API_KEY, GUS_API_KEY)
- `README.md` (setup guide zgodny z `architektura.md §4`)

Per workspace minimalny placeholder:

- `/apps/api` — `nest new` scaffold + Prisma init (BEZ schematu — to robi BE-1a w Sprint 1)
- `/apps/mobile` — `npx create-expo-app` z expo-router
- `/apps/panel` — `npx create-next-app` (App Router, TS)
- `/apps/landing` — `npx create-next-app` z `output: 'export'`
- Każdy workspace ma działający `pnpm dev` po zainstalowaniu

# SCOPE LIMIT

- NIE implementuj endpointów, komponentów, screenów
- NIE twórz schematu Prisma (to zadanie BE-1a w Sprint 1)
- NIE konfiguruj design tokens (to zadanie DS-0 w TASK-026)
- NIE dodawaj SMS / S3 / GUS integracji (kolejne sprinty)
- Skup się TYLKO na strukturze + działającym `pnpm dev` dla wszystkich 4 apps

# DELIVERABLE

Otwórz PR `sprint-0/infra-repo` z:

- Pełną strukturą katalogów
- Działającym `pnpm install && pnpm dev` (4 apki startują bez erroru)
- CI green na GitHub Actions

# DEFINITION OF DONE (sprawdź zanim zgłosisz PR)

- [ ] `pnpm install` — bez erroru
- [ ] `pnpm dev` — 4 apki startują równolegle (Turborepo)
- [ ] `http://localhost:4000/v1/health` — NestJS scaffold odpowiada (domyślny endpoint)
- [ ] `http://localhost:3000` — Expo web
- [ ] `http://localhost:3001` — panel Next.js
- [ ] `http://localhost:3002` — landing Next.js
- [ ] `docker compose up -d` — Postgres + Mailpit działają
- [ ] `.env.example` ma WSZYSTKIE wymagane zmienne z listy powyżej
- [ ] README.md opisuje setup „od zera do działającego dev" w ≤ 10 krokach
- [ ] `.github/workflows/ci.yml` — push triggeruje lint + test + build, green

# STOP CONDITION

Gdy wszystkie DoD punkty spełnione → commit + push + otwórz PR z opisem „TASK-023 INFRA-REPO: scaffold
monorepo". Napisz mi krótki podsumowanie (5 linii max) co zostało zrobione i czekaj na review. NIE startuj
kolejnych zadań samodzielnie.

# NIE ROB

- Nie uruchamiaj INFRA-DX (TASK-025) ani DS-0 (TASK-026) — to osobne agenty, osobne PR-y
- Nie commituj `.env.local` ani secrets
- Nie dodawaj nic do `architektura.md`, `plan-sprintow.md` itp. — dokumentacja jest gotowa, nie zmieniamy
- Nie wybieraj alternatywnego stacku (Yarn zamiast pnpm, Remix zamiast Next.js, itp.) — stack jest zablokowany
  ADR-001

---

Co się wydarzy po TASK-023

Po merge TASK-023 otworzysz nową instancję Claude Code dla kolejnego agenta. Przygotuję Ci prompt:

1. TASK-025 INFRA-DX (parallel — CI/CD fine-tuning, VS Code config, husky pre-commit)
2. TASK-026 DS-0 (parallel — ekstrakcja tokenów z /design/01-home.html :root do @opony/design-tokens + 10
   komponentów w 2 flavors)
3. TASK-028 — merge Sprint 0 + weryfikacja
4. Dalej TASK-029 BE-1a Schema Owner (pierwszy Sprint 1 task — tu zaczyna się prawdziwy B2B)

Każdy będzie osobnym, self-contained promptem z DoD i stop condition.

Jak używać

1. Skopiuj Master prompt (A) → wklej do nowej sesji Claude Code w folderze gdzie ma powstać projekt
2. Claude potwierdzi że przeczytał docs
3. Skopiuj INFRA-REPO prompt (B) → wklej w tej samej sesji
4. Agent pracuje, otwiera PR, daje podsumowanie
5. Ty (lub osobna sesja Architekt) robisz review
6. Merge → wracasz do mnie po kolejny prompt

Pytania przed startem:

- Masz już założone repo GitHub (TASK-005) i wszystkie konta (TASK-003, 004, 006-013)?
- Jeśli tak — odpalaj. Jeśli nie — wróć do checklist-orkiestratora.md FAZA 0 najpierw.
