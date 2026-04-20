# Opony.app — dokumentacja MVP v0

> Aplikacja „Booksy dla opon" — rezerwacja wymiany opon online.
> Miasto pilotażowe: **Nowy Sącz**. Zespół 4 os. × 7 tygodni.

## Dokumenty

| Dokument | Opis | Linii |
|---|---|---:|
| [Analiza biznesowa](docs/analiza-biznesowa.md) | Kontekst, rynek, persony, konkurencja, UVP, monetyzacja, koszty, unit economics, GTM | ~650 |
| [Architektura](docs/architektura.md) | Stack, model danych, REST API, integracje, decyzje MVP v0, schemat DB | ~950 |
| [Plan sprintów + backlog](docs/plan-sprintow.md) | 58 user stories, wireframy, 7 sprintów, fazy rozwoju, migracja v0→v1 | ~2030 |
| [Plan agentów AI](docs/plan-agentow.md) | Role (Orkiestrator, Architekt, Projektant, Developer, Tester), workflow, quality gates | ~400 |
| [Checklist Orkiestratora](docs/checklist-orkiestratora.md) | **Twoja TODO lista** — krok po kroku od kont po public launch, checkboxy | ~340 |

## Kluczowe metryki MVP v0

| Metryka | Wartość |
|---|---|
| User stories | 58 (43 MUST / 15 SHOULD) |
| Story points MUST | 139 SP |
| Zespół | 4 osoby (2 mid + 1 senior + 1 designer part-time) |
| Czas do launchu | ~7 tygodni (7 sprintów × 20 SP/tydz) |
| Koszt setup | ~161 000 PLN |
| Runway bootstrap (rok 1) | ~371 000 PLN |
| Cash burn rok 1 | ~331 000 PLN |
| Break-even infra | ~400 rez/mc |
| UM (Twilio + P24) | 10,00 PLN/rez |
| Prowizja | 8% (auto via Przelewy24) |
| Cel M6 | 18 providerów, 600 rez/mc |

## Stack technologiczny (MVP v0)

- **Frontend klient:** PWA (Next.js)
- **Frontend B2B:** Web (Next.js)
- **Backend:** NestJS (Node.js)
- **Baza danych:** PostgreSQL (bez PostGIS w v0)
- **Płatności:** Przelewy24 (BLIK + karta)
- **SMS:** Twilio → migracja SMSAPI.pl
- **Mapy:** Google Maps JS API
- **Admin:** Retool
- **Monitoring:** Sentry + PostHog

## Ścieżka ekspansji

```
Nowy Sącz (v0, pilot)
     ↓ walidacja
Tarnów → Rzeszów → Kraków (v1)
     ↓
Katowice / Wrocław / Poznań (skalowanie, rok 2–3)
```
