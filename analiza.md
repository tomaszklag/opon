# Opony.app — dokumentacja MVP v0

> Aplikacja „Booksy dla opon" — rezerwacja wymiany opon online.
> Miasto pilotażowe: **Nowy Sącz**. Zespół 4 os. × 7 tygodni.
> **Design phase: ZAMKNIĘTA** (2026-04-22) · 38 ekranów HTML w [`/design`](design/) · [ADR-008](docs/architektura.md#adr-008-design-phase-closed--38-ekranów-3-artefakty-2026-04-22)

## Dokumenty

| Dokument | Opis |
|---|---|
| [Analiza biznesowa](docs/analiza-biznesowa.md) | Kontekst, rynek, persony, konkurencja, UVP, monetyzacja, koszty, unit economics, GTM |
| [Architektura](docs/architektura.md) | Stack, model danych, REST API, integracje, 8 ADR-ów (w tym ADR-004 bez-płatności, ADR-008 design-closed), schemat DB |
| [Plan sprintów + backlog](docs/plan-sprintow.md) | 58 user stories, wireframy §12 z linkami do `/design`, **§12.Z pełna mapa 38 ekranów**, 7 sprintów |
| [Plan agentów AI](docs/plan-agentow.md) | Role (Orkiestrator, Architekt, Projektant, Developer×3: mobile/panel/landing, Tester), workflow, prompt templates z ref do `/design` |
| [Checklist Orkiestratora](docs/checklist-orkiestratora.md) | **Twoja TODO lista** — krok po kroku od kont po public launch, TASK-021b „przejrzyj design", checkboxy |
| [Design — 38 ekranów HTML](design/) | 21 klient mobile (w tym 3 polish: offline/PWA/error) · 14 B2B panel · 3 landing — industrial-dark, amber accent. Source of truth dla FE |

## Kluczowe metryki MVP v0

| Metryka | Wartość |
|---|---|
| User stories | 58 (43 MUST / 15 SHOULD) |
| Story points MUST | 125 SP (po ADR-004 —16 SP za usunięty Payment module) |
| Zespół | 4 osoby (2 mid + 1 senior + 1 designer part-time) |
| Czas do launchu | ~5–6 tygodni (po ADR-004 — skrócone z 7 tyg) |
| Ekrany designu | 38 HTML (21 klient w tym 3 polish + 14 B2B + 3 landing) |
| Koszt setup | ~161 000 PLN |
| Runway bootstrap (rok 1) | ~371 000 PLN |
| Cash burn rok 1 | ~331 000 PLN |
| UM v0 (tylko Twilio SMS) | ~1,20 PLN/rez *(bez P24 w v0 — ADR-004)* |
| Prowizja v0 | **0%** (free pilot Nowy Sącz — ADR-004) |
| Prowizja v0.5+ | 8% (decyzja P24 split vs invoicing po pilocie) |
| Cel M6 | 18 providerów, 600 rez/mc |

## Stack technologiczny (MVP v0)

- **Klient (mobile + web):** Expo SDK 50+ + React Native Web (`app.opony.app` + iOS/Android — jeden codebase, v0 klient-only, v0.5/v1+ provider features w tej samej apce)
- **Provider portal:** Next.js 14 desktop-first (`panel.opony.app` — onboarding, cennik, godziny, strefa, rezerwacje, ustawienia)
- **Landing:** Next.js 14 SSG (`opony.app` — SEO, `/nowy-sacz`, `/p/<slug>` publiczny profil warsztatu)
- **Backend:** NestJS (Node.js)
- **Baza danych:** PostgreSQL (bez PostGIS w v0)
- **Płatności:** **BRAK w v0** (ADR-004 — free pilot); v0.5+ Przelewy24 (BLIK + karta)
- **SMS:** Twilio → migracja SMSAPI.pl
- **Mapy:** Google Maps JS API
- **Admin:** Retool
- **Monitoring:** Sentry + PostHog
- **Design reference:** 39 statycznych HTML mockupów w `/design` (industrial-dark, Bebas Neue + Archivo + JetBrains Mono, graphite `#0A0B0E` + amber `#FF6B1A`)

## Reguły architekturalne (utrwalone w design phase)

1. **Zero booking-flow w landing i panel** — wszystkie rezerwacje wyłącznie w `app.opony.app` (mobile + web PWA); landing/panel ma CTA „Otwórz w aplikacji" (Universal Links + QR dla desktop). Wyjątek: b2b-13 „Rezerwacja ręczna" dla wizyt zgłaszanych telefonicznie.
2. **Miasto pilot = Nowy Sącz** (nie Poznań jak w oryginalnych założeniach).
3. **Zero płatności w v0** (ADR-004) — wracają w v0.5+ po danych z pilota.

## Ścieżka ekspansji

```
Nowy Sącz (v0, pilot — 23 warsztaty, 0% prowizji, free)
     ↓ walidacja (8 providerów × 3 mc + dane retention/NPS)
Tarnów → Rzeszów → Kraków (v0.5 + v1 — włączamy monetyzację)
     ↓
Katowice / Wrocław / Poznań (skalowanie, rok 2–3)
```
