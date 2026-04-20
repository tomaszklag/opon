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

| Odpowiedzialność | Kiedy |
|---|---|
| Uruchamianie agentów z promptami z `plan-sprintow.md` sekcja 20 | Początek każdego sprintu |
| Review i merge PR-ów do `main` | Po DoD agenta + code review Architekta |
| Uruchamianie checklisty integracyjnej | Koniec każdego sprintu |
| Decyzje produktowe (scope change, priorytetyzacja) | Na bieżąco |
| Konfiguracja external services (Twilio, P24, S3, Retool) | Sprint 0 + przed soft-launch |
| Deploy na staging/produkcję | Po sprincie 7 |
| GTM (outreach, onboarding providerów) — patrz `analiza-biznesowa.md` sekcja 17 | Równolegle od sprintu 3 |

**Narzędzia:** GitHub (PR review, merge), Railway dashboard, Vercel dashboard, Retool Cloud, terminal (pnpm commands).

---

### 2.2. Architekt (1 agent AI)

**Rola:** Strażnik jakości kodu i zgodności z architekturą. Nie pisze feature'ów — reviewuje i poprawia.

| Odpowiedzialność | Input | Output |
|---|---|---|
| **Code review** PR-ów BE/FE | PR diff + `architektura.md` | Komentarze: co poprawić, approved/rejected |
| **Schema review** | `schema.prisma` po migracjach BE | Zgodność z sekcją 8 (model danych), brakujące indeksy/constraints |
| **API review** | Swagger `/v1/docs` po sprincie | Zgodność z sekcją 9 (kontrakt API), brakujące endpointy |
| **Security review** | Cały codebase per sprint | Rate limiting, injection, auth bypass, RODO |
| **Pattern enforcement** | PR diff | Guards, DI, error handling (RFC 7807), naming conventions |
| **Refactoring** | Po sprincie, jeśli tech debt | Cleanup, extract shared code, fix anti-patterns |

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

**Rola:** Buduje design system i pilnuje spójności wizualnej. Nie pisze logiki biznesowej.

| Odpowiedzialność | Input | Output |
|---|---|---|
| **Design System** (Sprint 0) | Design tokens + wireframy (12.1–12.17) | 10 base komponentów + Storybook |
| **UI review** FE PR-ów | PR diff + wireframy | Komentarze: pixel-perfect, a11y, responsiveness |
| **Nowe komponenty** (na żądanie) | Opis + wireframe | Komponent w `@opony/design-system` |
| **A11y audit** | Deployed app | Raport: brakujące ARIA, focus states, kontrast |
| **Responsive testing** | Deployed app | Raport: broken layouts na mobile/tablet/desktop |

**Kiedy działa:**
- **Sprint 0:** Buduje DS-0 (10 base komponentów + Storybook) — **to jedyny sprint gdzie pisze dużo kodu**
- **Sprint 1–6:** UI review PR-ów FE (po każdym FE PR) — sprawdza zgodność z wireframami
- **Sprint 7:** A11y audit + responsive audit przed soft-launch

**Prompt template dla Projektanta (Sprint 0):**
```
Stwórz /packages/design-system z 10 komponentami:
Button, Input, Badge, Card, Modal, BottomTabBar, SideMenu, Spinner, Toast, EmptyState.
Styluj design tokenami z /packages/design-tokens.
Semantic HTML + ARIA. Storybook z jednym story per komponent.
Referencje: architektura.md sekcja 7, wireframy 12.1–12.17.
```

**Prompt template dla Projektanta (UI review):**
```
Zrób UI review PR-a [branch-name]. Sprawdź:
1. Zgodność z wireframem W:12.X (plan-sprintow.md)
2. Użycie komponentów z @opony/design-system (nie custom)
3. Responsywność (mobile 375px, tablet 768px, desktop 1280px)
4. A11y: semantic HTML, ARIA labels, focus states, kontrast WCAG AA
5. Design tokens: zero hardcoded colors/spacing/fonts
```

---

### 2.4. Developer BE — Backend (wielu agentów AI)

**Rola:** Pisze moduły NestJS, migracje Prisma, integracje z external services. Jeden agent per task (BE-1a, BE-1b, BE-2, BE-3...).

| Odpowiedzialność | Input | Output |
|---|---|---|
| **NestJS modules** | Prompt z `plan-sprintow.md` sekcja 20 | Moduł: controller + service + dto + testy |
| **Prisma migrations** (schema owner) | `architektura.md` sekcja 8 (schemat) | `schema.prisma` + migration |
| **External integrations** | `architektura.md` sekcja 10 (integracje) | Service: Twilio, P24, S3, GUS, Resend |
| **Cron jobs** | `architektura.md` sekcja 9.9 (crony) | `@Cron` decorated services |
| **Seed data** | Kontekst biznesowy (Nowy Sącz, 5 providerów) | `seed.ts` |
| **Unit testy** | Napisany kod | Jest + supertest, min. 3–5 per moduł |

**Ile agentów BE per sprint:**

| Sprint | Agenty BE | Co robią |
|---|---|---|
| 0 | INFRA-REPO, INFRA-DX | Scaffold, tooling |
| 1 | BE-1a (schema), BE-1b (auth), BE-2 (provider) | Fundament |
| 2 | BE-3 | Katalog + availability |
| 3 | BE-4 | Booking + P24 + paymentTimeout cron |
| 4 | BE-5 | Panel B2B + S3 upload |
| 5 | BE-6 | Reviews + settlement + refund |
| 6 | BE-7 | Upload + admin + crony |
| 7 | BE-8a (features), BE-8b (crony) | Polish + systemowe |

**Reguły:**
- **Schema owner** pisze migracje Prisma — JEDEN per sprint (patrz sekcja 20 w `plan-sprintow.md`)
- Każdy agent na osobnym branchu `sprint-X/be-Y`
- Testy MUSZĄ przechodzić przed PR
- Swagger `/v1/docs` aktualizowany po każdym agentu

---

### 2.5. Developer FE — Frontend (wielu agentów AI)

**Rola:** Pisze strony Next.js, komponenty React, integrację z API. Jeden agent per task (FE-1, FE-2, FE-3...).

| Odpowiedzialność | Input | Output |
|---|---|---|
| **Next.js pages** | Wireframy (12.x) + prompt z sekcji 20 | `app/` pages + components |
| **MSW handlers** (dzień 1–2) | Kontrakt API (architektura.md sekcja 9) | `/mocks/handlers/*.ts` |
| **Real API integration** (dzień 3–5) | Gotowe API z BE | Swap MSW → `@opony/api-client` |
| **Formularze** | Wireframy + walidacja | React Hook Form + Zod |
| **Mapy** | Wireframe 12.13, 12.7 | Google Maps JS API components |

**Ile agentów FE per sprint:**

| Sprint | Agenty FE | Co robią |
|---|---|---|
| 0 | DS-0 | Design system (10 komponentów) |
| 1 | FE-1 (klient auth), FE-2 (B2B wizard) | Login, profil, onboarding |
| 2 | FE-3 | Lista + mapa + filtry |
| 3 | FE-4 | Booking flow + payment |
| 4 | FE-5a (dashboard), FE-5b (CRUD) | Panel B2B |
| 5 | FE-6a (profil+oceny), FE-6b (B2B opinie+finanse) | Oceny + rozliczenia |
| 6 | FE-7a (rezerwacje klient), FE-7b (onboarding wizard) | Historia + onboarding |
| 7 | FE-8 | Szczegół rez B2B + manual booking |

**Reguły:**
- **Start z MSW od dnia 1** — nie czekaj na BE
- Używaj TYLKO komponentów z `@opony/design-system`
- Formularze: React Hook Form + Zod (walidacja identyczna z BE)
- API calls: `@opony/api-client` (typed fetch z OpenAPI)

---

### 2.6. Tester / QA (1 agent AI)

**Rola:** Pisze testy automatyczne i weryfikuje jakość. Działa głównie w sprincie 7, ale smoke testy per sprint.

| Odpowiedzialność | Input | Output |
|---|---|---|
| **E2E testy** (Playwright) | Wireframy + flow z sekcji 4 (architektura.md) | `e2e/tests/*.spec.ts` |
| **Cron testy** | Sekcja 9.9 (crony) | `e2e/cron-tests/*.sh` |
| **Smoke testy** (per sprint) | Checklista integracyjna z sekcji 20 | Pass/fail raport |
| **Performance test** | Deployed app | Lighthouse score, p95 API latency |
| **Security scan** | Deployed app + codebase | OWASP top 10, dependency audit |

**Kiedy działa:**

| Sprint | Co robi Tester |
|---|---|
| 0–6 | Smoke test po każdym sprincie (5–10 min, checklista z sekcji 20) |
| 7 | **Główna faza:** E2E (3 flow), cron testy (4 scenariusze), performance, security |
| Pre-launch | Final regression + load test (opcjonalny) |

**Prompt template (Sprint 7):**
```
Napisz Playwright E2E testy dla 3 flow:
1. Klient: login OTP → szukaj → rezerwuj → zapłać (mock P24) → potwierdzenie
2. Provider: login OTP → dashboard → akceptuj → rozpocznij → zakończ
3. Onboarding: signup → NIP → upload → (admin approve) → login → dashboard
Użyj seed data z BE-1a. Mock: Twilio (intercept), P24 (redirect mock).
Osobno: bash skrypty testujące crony (NO_SHOW, paymentTimeout, payout, rating).
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

| Dzień | Kto | Co robi |
|---|---|---|
| **1 rano** | Orkiestrator | Kopiuje prompt z sekcji 20 → uruchamia BE dev + FE dev |
| **1** | BE dev (schema owner) | Pisze migracje + API endpoints + testy |
| **1** | FE dev | Pisze UI z MSW mockami (własne handlery z kontraktu API) |
| **1 wieczór** | Architekt | Reviewuje schemat BE dev (jesli schema owner) |
| **2–3** | BE dev | Kończy API, pushuje PR |
| **2–3** | FE dev | Kończy UI z MSW, pushuje PR |
| **2–3** | Architekt | Code review obu PR-ów |
| **2–3** | Projektant | UI review FE PR-a |
| **3–4** | FE dev | Swap MSW → real API, fixuje integrację |
| **4–5** | Orkiestrator | Merge PR-ów do `main` po approvalach |
| **5** | Tester | Smoke test (checklista integracyjna sprintu) |
| **5** | Orkiestrator | Zielone światło → następny sprint |

---

## 4. Narzędzia per rola

| Rola | Narzędzia AI | Pliki referencyjne |
|---|---|---|
| **Orkiestrator** | Claude Code (CLI), GitHub, terminal | `plan-sprintow.md` sekcja 20 (prompty) |
| **Architekt** | Claude Code z kontekstem repo | `architektura.md` (cały plik) |
| **Projektant** | Claude Code + Storybook | `architektura.md` sekcja 7, wireframy 12.x |
| **Developer BE** | Claude Code (worktree isolation) | `architektura.md` sekcje 5, 8, 9, 10 |
| **Developer FE** | Claude Code (worktree isolation) | wireframy 12.x, `architektura.md` sekcje 7, 9 |
| **Tester** | Claude Code + Playwright | `architektura.md` sekcja 9, wireframy |

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
| Kto | Co sprawdza |
|---|---|
| Architekt | Architektura, wzorce, security, testy, API contract |
| Projektant | UI zgodny z wireframem, a11y, responsive, design tokens |

Jeśli rejected → agent dostaje feedback i poprawia (max 2 retry).

### Gate 3: Integracja (Orkiestrator + Tester)
Po merge do `main`:
- [ ] Checklista integracyjna sprintu (sekcja 20)
- [ ] Smoke test kluczowego flow
- [ ] Seed data rozszerzony i działa

---

## 6. Harmonogram agentów per sprint

| Sprint | Orkiestrator | Architekt | Projektant | Dev BE | Dev FE | Tester |
|---|---|---|---|---|---|---|
| **0** | Setup repo, env | Review scaffold | **DS-0** (design system) | INFRA-REPO, INFRA-DX | — | — |
| **1** | Uruchom 4 agentów | Review schema (ALL tables!) | UI review FE-1, FE-2 | BE-1a, BE-1b, BE-2 | FE-1, FE-2 | Smoke |
| **2** | Uruchom 2 agentów | Code review | UI review FE-3 | BE-3 | FE-3 | Smoke |
| **3** | Uruchom 2 agentów | Code review (P24!) | UI review FE-4 | BE-4 | FE-4 | Smoke |
| **4** | Uruchom 3 agentów | Code review | UI review FE-5a, FE-5b | BE-5 | FE-5a, FE-5b | Smoke |
| **5** | Uruchom 3 agentów | Code review | UI review FE-6a, FE-6b | BE-6 | FE-6a, FE-6b | Smoke |
| **6** | Uruchom 3 + Retool | Code review + Retool config | UI review FE-7a, FE-7b | BE-7 | FE-7a, FE-7b | Smoke |
| **7** | Final review | **Security audit** | **A11y audit** | BE-8a, BE-8b | FE-8 | **QA-E2E + QA-CRON** |

---

## 7. Ile agentów potrzebujesz

**Minimum (sekwencyjne pary):** 4 agenty jednocześnie
- 1 × Architekt (review)
- 1 × BE dev
- 1 × FE dev
- 1 × Projektant/Tester (dzielony)

**Optimum (pełna równoległość):** 6 agentów jednocześnie
- 1 × Architekt
- 1 × Projektant
- 2 × BE dev (Sprint 1: BE-1a + BE-1b równolegle z BE-2)
- 2 × FE dev (Sprint 4–6: FE-5a + FE-5b równolegle)

**W praktyce:** nie potrzebujesz 6 stałych agentów. Uruchamiasz tyle, ile wymaga sprint:

| Sprint | Jednoczesnych agentów |
|---:|---:|
| 0 | 3 (INFRA-REPO + INFRA-DX + DS-0) |
| 1 | 5 (BE-1a → BE-1b + BE-2 + FE-1 + FE-2) + Architekt review |
| 2 | 2 + review (BE-3, FE-3) |
| 3 | 2 + review (BE-4, FE-4) |
| 4 | 3 + review (BE-5, FE-5a, FE-5b) |
| 5 | 3 + review (BE-6, FE-6a, FE-6b) |
| 6 | 3 + review + Retool (human) (BE-7, FE-7a, FE-7b) |
| 7 | 5 + review (BE-8a, BE-8b, FE-8, QA-E2E, QA-CRON) |

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

| Sytuacja | Kto reaguje | Akcja |
|---|---|---|
| Agent nie osiąga DoD po 2 retry | Orkiestrator | Human review + manual fix |
| Merge conflict | Schema owner merge'uje pierwszy, reszta rebase | Architekt asystuje |
| Failing testy po merge | Tester identyfikuje, Dev fixuje | Hotfix branch |
| External service nie działa (P24, Twilio) | Orkiestrator | Mock w dev, fix credentials |
| Scope creep (agent dodaje nieproszone feature) | Architekt | Reject PR, przypomnij scope |
| Performance issue | Tester | Profiling, Architekt rekomenduje fix |
