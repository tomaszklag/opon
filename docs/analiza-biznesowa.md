# Analiza biznesowa — Opony.app

> Miasto pilotażowe: **Nowy Sącz**. Dokument opisuje kontekst rynkowy, persony, konkurencję, monetyzację, koszty, unit economics i strategię GTM.

## 1. Kontekst

Dwa razy w roku (wiosna/jesień) miliony kierowców w Polsce wymieniają opony. Rynek obsługują dwa typy usługodawców:

- **Warsztaty stacjonarne (wulkanizacje)** — największy udział rynku, stały adres, często pełna mechanika.
- **Mobilne punkty wymiany** — rosnący segment; przyjeżdżają do klienta (dom, praca).

**Problem:** proces umawiania pozostał w XX wieku — telefony, brak przejrzystych cen, brak rzeczywistej dostępności terminów, brak jednolitej oceny jakości. Booksy rozwiązało to dla branży beauty, ale motoryzacja (zwłaszcza wymiana opon) nie ma dominującego gracza w modelu self-service booking.

**Cel produktu:** aplikacja mobilna cross-platform, która pozwala kierowcy w < 2 minuty zarezerwować konkretną godzinę wymiany opon — w warsztacie lub u siebie pod domem — z jawnym cennikiem, mapą punktów, ocenami i bez telefonowania.

**Zakres zdecydowany z użytkownikiem:**
- Dokument obejmuje **biznes + technikę**.
- MVP obsługuje **warsztaty stacjonarne i mobilne punkty** (oba segmenty).
- Platforma: **React Native (cross-platform iOS + Android)**.
- W zakresie: aplikacja klienta **oraz** panel usługodawcy (B2B).

---

## 2. Analiza rynku i problemu

### 2.1. Persony

**Kierowca-Klient (Marek, 38 l.)**
- Pracuje, nie ma czasu dzwonić w godzinach pracy warsztatów.
- Chce znać cenę z góry, zobaczyć opinie, porównać 2–3 punkty w okolicy.
- Ceni wygodę mobilnego serwisu, ale jest wrażliwy cenowo.

**Właściciel warsztatu (Pan Janusz, 52 l.)**
- Prowadzi 2-stanowiskową wulkanizację.
- Problem: telefony blokują pracę, double-booking w papierowym kalendarzu, „no-show" klientów.
- Chce prostego narzędzia — bez szkoleń IT.

**Operator mobilnego punktu (Kasia, 29 l.)**
- Ma van + 2 pracowników, obsługuje miasto.
- Problem: optymalizacja tras między klientami, potwierdzanie wizyt SMS-em ręcznie.
- Kluczowe: aplikacja musi wspierać logistykę tras, nie tylko kalendarz.

### 2.2. Konkurencja

| Gracz | Model | Luka |
|---|---|---|
| Booksy | Beauty self-service | Nie obsługuje motoryzacji — kalendarz nie rozumie pojęć „rozmiar felgi", „typ opony", „mobilny dojazd" |
| Oponeo, Intercars | E-commerce opon + partnerski montaż | Montaż to dodatek do zakupu, nie core; brak UX samej rezerwacji |
| Moto-integrator / Motoricus | Porównywarka warsztatów | Generuje leady, ale klient i tak dzwoni |
| iParts, Carvago | Mechanika ogólna | Brak fokusu na opony i ich sezonowość |

**Wniosek:** Istnieje wyraźna nisza — self-service booking dedykowany wymianie opon z obsługą obu modeli (stacjonarny + mobilny).

### 2.3. Unikalna propozycja wartości (UVP)

> „Zarezerwuj wymianę opon w 2 minuty — zobacz cenę, wybierz godzinę, a jeśli chcesz, to *oni* przyjadą do Ciebie."

### 2.4. Monetyzacja (rekomendacja)

- **Prowizja** od zrealizowanej rezerwacji (**8%**, pobierana automatycznie z płatności online) — główny strumień.
- **Abonament** dla usługodawcy (freemium → paid za statystyki, promowanie, wielu pracowników).
- **Płatne wyróżnienia** w wynikach mapy/listy.
- Brak opłat dla klienta końcowego (jak Booksy).

### 2.5. Ryzyka i mitygacje

| Ryzyko | Mitygacja |
|---|---|
| Sezonowość (2 piki/rok) | Rozszerzenie o inne usługi sezonowe: przechowywanie opon, wyważanie, geometria |
| „Pusty marketplace" na starcie | Strategia „city-by-city launch" — najpierw zapełnić jedno miasto usługodawcami, potem klienci |
| Usługodawcy nie potwierdzają rezerwacji | Auto-akceptacja + SLA + system ocen karzący ignorowanie |
| No-show klientów | Depozyt / kara / ograniczenie rezerwacji po X no-shows |

---

## 3. Funkcje MVP (zakres v1)

### 3.1. Aplikacja Klienta

**Must-have:**
- Onboarding + logowanie (email/Google/Apple, SMS OTP).
- Profil pojazdu: marka/model/rocznik → **automatyczna** wiedza o rozmiarze felg (lookup z bazy VIN / modelu).
- Wyszukiwarka punktów:
  - **Mapa** (Google Maps / Mapbox) + lista.
  - Filtry: stacjonarny/mobilny, cena, ocena, dostępność *dziś/jutro/weekend*.
  - Sortowanie: odległość / cena / ocena.
- Karta punktu: zdjęcia, **jawny cennik** (wymiana wg rozmiaru), opinie, godziny pracy, opis.
- Rezerwacja:
  - Wybór usługi (wymiana / przełożenie z felg / wyważanie / przechowywanie).
  - Wybór rozmiaru opon (auto z profilu pojazdu).
  - Kalendarz dostępnych slotów (real-time).
  - Dla mobilnych: adres dojazdu + walidacja strefy obsługi.
  - Potwierdzenie → push + email.
- Powiadomienia: przypomnienie 24h/1h przed, status wizyty.
- Historia wizyt + **ocena i komentarz** po realizacji.
- Ulubione punkty.

**Nice-to-have (v1.1):**
- ~~Płatność online~~ → **przeniesione do MVP v0** (patrz sekcja 11, 15.7a) — Przelewy24 BLIK + karta.
- Apple Pay / Google Pay (via Stripe, v1).
- Invite-a-friend.
- Program lojalnościowy (5. wymiana -10%).

### 3.2. Panel Usługodawcy (B2B)

**Must-have:**
- Onboarding firmy (NIP, adres, strefa mobilna jako polygon na mapie).
- Zarządzanie kalendarzem: stanowiska / technicy / sloty.
- **Cennik**: macierz rozmiar opony × typ usługi.
- Godziny pracy + wyjątki (święta, urlopy).
- Lista rezerwacji: akceptacja/odrzucenie/re-schedule/no-show.
- Profil publiczny: zdjęcia, opis, certyfikaty.
- Odpowiedzi na recenzje.
- Podstawowe statystyki (rezerwacje, obrót, ocena średnia).

**Dla mobilnych punktów — specyficzne:**
- Widok trasy dnia (kolejność wizyt + nawigacja).
- Bufor czasu dojazdu między wizytami.
- Dynamiczna strefa dostępności (promień od bieżącej lokalizacji).

### 3.3. Panel Admina (operator platformy)

- Moderacja usługodawców (weryfikacja NIP, dokumenty).
- Moderacja recenzji (anty-fake, zgłoszenia).
- Rozliczenia prowizji (faktury cykliczne).
- Dashboardy operacyjne (miasta, aktywność, churn).

---

## 4. Kluczowe przepływy UX

### 4.1. Rezerwacja — happy path klienta (< 2 minuty)

```
[Otwórz app] → [Mapa z punktami w okolicy]
     ↓
[Dotknij punkt] → [Karta: cena 180 zł, ocena 4.7, wolne dziś 14:00]
     ↓
[Rezerwuj 14:00] → [Auto-wybór: Ford Focus 2019 → 205/55 R16]
     ↓
[Potwierdź] → [Push: "Potwierdzone. Jutro 14:00, ul. X"]
```

### 4.2. Obsługa mobilnego punktu — dzień pracy operatora

```
Rano: [Panel → Trasa dnia] → 5 wizyt, zoptymalizowana kolejność
     ↓
Wizyta 1: [Nawiguj] → [Rozpocznij] → [Zakończ] → [Klient ocenia]
     ↓
System auto-reshuffluje trasę jeśli wizyta opóźniona > 15 min
```

## 9. Weryfikacja (kryteria sukcesu MVP)

**Produktowe:**
- Czas rezerwacji od otwarcia app < 120 sekund (mediana).
- > 70% rezerwacji auto-potwierdzone (bez ręcznej akcji usługodawcy).
- < 10% no-show.
- NPS klientów > 40, usługodawców > 30.

**Techniczne:**
- Testy E2E kluczowych flow (Detox dla RN, Playwright dla web).
- p95 latency API < 300 ms.
- Uptime > 99.5%.
- Crash-free sessions > 99.5%.

**Biznesowe (po 6 miesiącach od launchu w Nowym Sączu):**
- 1 miasto, 18+ aktywnych usługodawców, 600+ rezerwacji/mc w szczycie sezonu, TTFB < 7 dni, powtarzalny playbook replikacji.

---

## 10. Rekomendacja końcowa

Pomysł ma mocne podstawy: **realny problem + brak dominującego gracza + łatwy cross-sell sezonowy**. Największe ryzyko to klasyczny „cold start" marketplace'u — dlatego rekomenduję:

1. **Zacząć od Nowego Sącza** — mniejszy rynek (~85k), lokalna obecność, łatwy cold-start, naturalna ekspansja na Tarnów/Rzeszów/Kraków.
2. **Podejście „concierge MVP"** przed kodowaniem: ręcznie obsłużyć 20 pierwszych rezerwacji przez formularz + Excel, żeby zrozumieć realne workflow usługodawców.
3. **Budować klienta + B2B równolegle** (jak ustalono) — bez B2B usługodawcy nie wejdą.
4. **Rozszerzać sezonowo** (przechowywanie opon, serwis klimy latem) — zwalcza sezonowość.


---

## 16. Analiza kosztów i unit economics

**Zastrzeżenie:** Wszystkie kwoty to szacunki rzędu wielkości na podstawie publicznych cenników w 2026 r. — zweryfikuj aktualne ceny przed budżetowaniem.

### 16.1. Koszty jednorazowe (rozwój MVP v0)

Po rozszerzeniu backlog z sekcji 15 (**125 SP MUST**) i decyzji o zespole 4-osobowym — **zespół 4 os. × ~6 tygodni** (velocity ~20 SP/tydz):

| Rola | Koszt/tydz (PLN netto) | Tygodni | Łącznie |
|---|---:|---:|---:|
| Senior Fullstack (RN/Next/Node) | 8 000 | 6 | 48 000 |
| Mid Fullstack #1 | 6 000 | 6 | 36 000 |
| Mid Fullstack #2 | 6 000 | 6 | 36 000 |
| Designer UX/UI (part-time) | 4 000 | 4 | 16 000 |
| **Dev razem** | | | **136 000** |

Dodatkowe koszty jednorazowe:
- Rejestracja domeny, logo, brand ~2 000 PLN
- Teksty prawne (regulamin, polityka prywatności, RODO, umowa z providerami) — kancelaria ~5 000 PLN
- Zdjęcia marketingowe (fotograf, stocki) ~3 000 PLN
- Zapas na nieprzewidziane (10%) ~15 000 PLN
- **Razem setup: ~161 000 PLN**

**Zmiana vs. poprzedni szacunek (zespół 3 os., 83 SP MUST): +40 000 PLN (~+33%).** Różnica wynika z dodatkowego mid-deva na 6 tygodni. Czas do launchu pozostaje ~6 tygodni (zgodnie z opcją (a) z sekcji 15.8).

### 16.2. Koszty stałe miesięczne (po launchu, 1 miasto)

| Pozycja | Usługa | Koszt/mc (PLN) |
|---|---|---:|
| Hosting app + API | Railway / Render (starter) — może wzrosnąć po load testach | 150 |
| Postgres managed | Railway / Neon | 150 |
| Backup DB (daily S3 dump) | AWS S3 — disaster recovery poza managed PITR | 50 |
| S3 storage + CDN | AWS S3 + CloudFront (małe obciążenie) | 100 |
| Email transakcyjny | Resend / Postmark (~5k/mc) | 50 |
| Twilio — numer nadawczy / Sender ID | Miesięczny rental | 10 |
| Monitoring błędów | Sentry (Developer plan) | 110 |
| Monitoring uptime | UptimeRobot / Better Uptime (free tier) | 0 |
| Analytics produktowe | PostHog (free tier do limitu) | 0 |
| Google Maps | < 10k wyświetleń = free tier | 0 |
| Retool (admin) | Team plan — 1 user ⚠ (2 userów = ~800 PLN/mc) | 400 |
| Domena + SSL | — | 50 |
| **OC działalności** | Polisa ogólna (ochrona przed roszczeniami klientów/providerów) | 75 |
| Księgowość | Biuro (Sp. z o.o. z fakturami VAT do providerów) | 800 |
| **Marketing (base + sezonowy, uśredniony)** | SEO, Google/FB Ads, social content; Nowy Sącz = niższy CPC niż duże miasto | 2 000 |
| Support admin (soft cost) | ~1h/mc admin time na spory/reklamacje | 50 |
| **Razem stałe** | | **~3 995** |

**Uwaga:** marketing 2 000 PLN/mc (nie 3 000 jak zakładano dla Poznania) — Nowy Sącz ma niższy CPC, mocniejszy word-of-mouth i mniejszy audience. Szczyt (marzec–maj, wrzesień–listopad): 4 000 PLN/mc. Poza szczytem: 1 000 PLN/mc. Średnia uśredniona: ~2 000 PLN/mc.

### 16.3. Koszty zmienne (na rezerwację)

Scenariusze zależne od wyboru dostawcy SMS:

| Pozycja | Użyć/rez | Koszt — Twilio (startup) | Koszt — SMSAPI.pl (docelowo) |
|---|---|---:|---:|
| SMS — potwierdzenie do klienta | 1 | 0,30 | 0,12 |
| SMS — przypomnienia klient (24h + 1h) | 2 | 0,60 | 0,24 |
| SMS — nowa rezerwacja do providera | 1 | 0,30 | 0,12 |
| GUS API | — (tylko onboarding) | 0 | 0 |
| Geocoding Google | 1–2 | 0 (free tier $200/mc pokrywa ~40k rez/mc) | 0 |
| Infra per request | — | znikome | znikome |
| **Payment processing (Przelewy24)** | 1 | 3,20 (1,5% × 180 + 0,50) | 3,20 |
| **Razem / rezerwacja** | | **~4,40 PLN** | **~3,68 PLN** |

Nie wliczone (edge cases, nie per rezerwację):
- OTP login: 1 SMS raz na ~30 dni/user.
- SMS-y eskalacyjne do providera (US-29): 0–2 dodatkowo.
- SMS o anulowaniu / zmianie terminu: 0–1.
- Refundy: koszt refundu P24 ≈ 0 (provider pokrywa w swoich warunkach).

**Rekomendacja SMS:** start na Twilio (szybszy setup), migracja do SMSAPI po stabilizacji — oszczędność ~**60% na SMS**. Payment processing (P24) stałe niezależnie od dostawcy SMS.

### 16.4. Unit economics

**Założenia:**
- Średnia rezerwacja: 180 PLN brutto.
- Prowizja: 8% → **14,40 PLN/rezerwację**.
- Payment processing (Przelewy24): ~1,5% + 0,50 PLN = **~3,20 PLN/rezerwację**.

| Scenariusz | SMS | Payment | Koszt zmienny | UM (marża jednostkowa) |
|---|---:|---:|---:|---:|
| **Twilio + P24** | 1,20 | 3,20 | 4,40 | **10,00 PLN** |
| **SMSAPI + P24** | 0,48 | 3,20 | 3,68 | **10,72 PLN** |

**Uwaga:** UM niższa niż szacunki bez płatności (13,20 PLN) — payment processing zjada ~3,20 PLN/rez. Ale w zamian: **prowizja pobierana automatycznie**, zero ręcznego fakturowania, antyno-show przez debit upfront.

### 16.5. Break-even miesięczny

Koszty stałe: **~4 000 PLN/mc** (z 16.2, marketing 2k dla Nowego Sącza).

| Scenariusz | UM | Break-even (infra) | Break-even (infra + 1 dev junior 12k/mc) |
|---|---:|---:|---:|
| Twilio + P24 | 10,00 | **~400 rez/mc** | **~1 600 rez/mc** |
| SMSAPI + P24 | 10,72 | **~373 rez/mc** | **~1 493 rez/mc** |

**Interpretacja dla Nowego Sącza:** 400 rez/mc przy 18 aktywnych providerach = ~22 rez/mc na providera ≈ 1 rezerwacja dziennie. **Osiągalne wyłącznie w szczycie sezonu** (wiosna/jesień). Poza szczytem platforma operuje poniżej break-even infra — to normalne dla sezonowego marketplace'u.

### 16.6. Scenariusze wzrostu (Nowy Sącz, pierwsze 12 miesięcy)

Scenariusz bazowy z UM = 10,00 PLN (Twilio + P24), stałe ~4k/mc:

| Miesiąc | Providerzy | Rez/mc | Przychód (PLN) | Marża brutto (UM × N) | Wynik netto (marża − stałe 4k) |
|---:|---:|---:|---:|---:|---:|
| M1 (launch) | 5 | 30 | 432 | 300 | **−3 700** |
| M3 | 12 | 150 | 2 160 | 1 500 | **−2 500** |
| M6 (szczyt wiosenny) | 18 | 600 | 8 640 | 6 000 | **+2 000** |
| M9 (dolina letnia) | 19 | 300 | 4 320 | 3 000 | **−1 000** |
| M12 (szczyt jesienny) | 20 | 700 | 10 080 | 7 000 | **+3 000** |

**Rok 1 podsumowanie:**

| | PLN |
|---|---:|
| Rezerwacje łącznie | ~4 000 |
| Przychód brutto (prowizja 8%) | ~57 600 |
| Marża brutto (po zmiennych: SMS + P24) | **~40 000** |
| Koszty stałe (12 × 4k) | −48 000 |
| **Wynik operacyjny (przed dev salary)** | **−8 000** |
| 1 dev junior utrzymaniowy (12 × 12k) | −144 000 |
| **Wynik netto rok 1 (bez setup)** | **−152 000** |
| Setup (jednorazowy, z 16.1) | −161 000 |
| GTM B2B incentywy + seed demand (z 17.4, 17.9) | −18 000 |
| **Łączny cash burn rok 1** | **−331 000** |

**Wniosek:** Nowy Sącz jako mniejszy rynek + koszty payment processing dają **ujemny wynik operacyjny** (−8k) — platforma w 1 małym mieście nie pokrywa nawet infry.

**To jest normalne i zamierzone.** Cel Nowego Sącza to **walidacja modelu, nie zysk.** Jeśli po roku mamy:
- 20 aktywnych providerów,
- NPS > 30,
- 700 rez/mc w szczycie,
- powtarzalny playbook replikacji (19.7),
- automatycznie rozliczana prowizja (zero problemów z inkasem),

...to mamy zielone światło do ekspansji na Tarnów/Rzeszów/Kraków, gdzie większy rynek (×3–5 rezerwacji) spina ekonomikę.

**Sezonowość:** szczyty (M4–M6, M10–M12) generują **~70% rocznego przychodu**. Wynik netto dodatni TYLKO w miesiącach szczytu. Marketing musi być agresywny w szczycie, minimalny poza.

### 16.7. Runway — ile trzeba wyłożyć

**Scenariusz A: bootstrap (founder pracuje bez pensji 12 mc):**

| Pozycja | PLN |
|---|---:|
| Setup (16.1 — zespół 4 os. × 6 tyg.) | 161 000 |
| Koszty stałe 12 mc (infra + marketing 2k + OC + księg.) | 48 000 |
| GTM B2B + seed demand (z 17.4 + 17.9) | 18 000 |
| 1 dev junior utrzymaniowy (12 × 12k) | 144 000 |
| **Razem outflow** | **371 000** |
| Przychód rok 1 Nowy Sącz (netto po zmiennych: SMS + P24) | −40 000 |
| **Net cash burn rok 1** | **~331 000** |

**Potrzebny runway: ~371 000 PLN.** Faktyczna strata po roku: ~331k PLN. Payment processing (P24) dodaje ~13k do burn vs scenariusz bez płatności, ale **automatyzuje 100% inkasa prowizji** — zero ręcznego fakturowania, zero „zapomnianej" prowizji.

**Scenariusz B: z ekspansją (VC / anioły, 500k–800k PLN):**
- Rok 1: Nowy Sącz (walidacja) — burn 331k z 500k runway → zostaje 169k.
- Rok 2 Q1: +Tarnów (13k setup per miasto z 19.7), przychód rośnie.
- Rok 2 Q2: +Rzeszów (13k setup).
- Rok 2 Q3: 3 miasta × ~400 rez/mc = 1 200 rez/mc × 10 PLN UM = 12k marży/mc > stałe 4k/mc → **break-even operacyjny.**
- **Break-even operacyjny: ~Q3 roku 2.**
- Rok 3: +Kraków → cash-flow positive.

**Scenariusz C: lean (kompromisowy):**
- Founder sam jest seniorem i koduje v0 z 1 mid-devem → oszczędność ~48k na setup (113k zamiast 161k).
- Marketing 1 000 PLN/mc (tylko SEO + partnerstwa) → oszczędność 12k/rok.
- Bez oddzielnego dev utrzymaniowego (founder + mid-dev utrzymują) → oszczędność 144k/rok.
- **Razem runway: ~200 000 PLN**, burn rok 1: ~180k.
- Realny scenariusz dla bootstrappera z oszczędnościami.

### 16.8. Dźwignie poprawy ekonomiki

| Dźwignia | Efekt na UM | Efekt na stałe | Ryzyko |
|---|---|---|---|
| **Prowizja 10%** (zamiast 8%) | +3,60 PLN → UM 16,80 | — | Trudniej pozyskać providerów w fazie pilotażu |
| **Abonament providera** 99 PLN/mc (po pilotażu) | — | +stały przychód: 20 providerów × 99 = +1 980 PLN/mc (Nowy Sącz); skala rośnie z ekspansją | Churn providerów jeśli nie widzą ROI |
| **Wyróżnienia w liście** 200–500 PLN/mc | — | +2 000–5 000 PLN/mc (5–10 chętnych) | Psuje fairness platformy |
| **Cross-sell** (przechowywanie opon, serwis klimy) | Prowizja 15% → +27 PLN/rez nowej usługi | — | Wymaga nowych integracji, nowy backlog |
| **Migracja SMS → SMSAPI** | +0,72 PLN → UM 13,92 | — | Ryzyko migracji, testowanie dostarczalności |
| **WhatsApp Business** (zamiast SMS) | Jeszcze tańsze niż SMSAPI | — | Nie każdy klient ma WhatsApp; UX inny |
| **Push (v1 + natywna apka)** | Eliminuje 3/4 SMS = +0,90 PLN → UM ~14,10 | — | Wymaga RN apki + push infra |
| **Abonament freemium → paid** (stats + promowanie) | — | Stały MRR niezwiązany z transakcjami | Wymaga wartości za którą providerzy zapłacą |

**Rekomendacja dźwigni wg kolejności wdrożenia:**
1. **SMSAPI** (po stabilizacji, tydzień pracy) — natychmiastowe +0,72 PLN/rez.
2. **Push notifications** (v1, po RN launch) — oszczędność ~0,90 PLN/rez, lepszy UX.
3. **Abonament 99 PLN/mc** (po 50+ providerach) — stabilny MRR.
4. **Prowizja 10%** (po zbudowaniu demand) — dopiero gdy providerzy widzą wartość i mają 30+ rez/mc.
5. **Wyróżnienia** (po 30+ providerach w mieście) — gdy jest z kim konkurować.
6. **Cross-sell** (rok 2) — nowy segment, nowy backlog.


---

## 17. Strategia GTM — Nowy Sącz jako miasto pilotażowe

**Zmiana strategiczna:** Miasto pilotażowe zmienione z Poznania na **Nowy Sącz**. Powody:
- Lokalna obecność / znajomość rynku foundra.
- Mniejszy rynek (~85k mieszkańców, powiat ~200k) = łatwiej „owning the market".
- Mocniejszy word-of-mouth w mniejszej społeczności.
- Niższe koszty marketingu.
- Naturalna ścieżka ekspansji: Nowy Sącz → Tarnów → Rzeszów → Kraków.

**Cel docelowy: ~20 aktywnych providerów** (nie 50 jak w Poznaniu — mniejszy rynek, pełne pokrycie wymaga mniej graczy).

### 17.1. Research i segmentacja rynku (Nowy Sącz)

**Jak policzyć rynek:**
1. Google Maps: kwerendy „wulkanizacja Nowy Sącz", „wymiana opon Nowy Sącz", „mobilna wymiana opon Nowy Sącz", „wulkanizator dojazd Sądecczyzna".
2. OLX / Fixly / Oferteo — ogłoszenia usługowe „wymiana opon powiat nowosądecki".
3. Grupy FB: „Nowy Sącz kierowcy", „Sądeczanie za kółkiem", „OLX Nowy Sącz".
4. Panorama Firm + REGON (PKD 45.20.Z — naprawa pojazdów mechanicznych) w powiecie nowosądeckim.
5. Obdzwonienie wyników → Excel z deduplikacją (te same firmy na wielu platformach).

**Szacunek wielkości rynku:**
- **Populacja:** ~85k (miasto), ~200k (powiat nowosądecki + okolice).
- **Zarejestrowane samochody** (szacunek): ~60–80k w powiecie.
- **Potencjał wymian/rok:** ~60–80k × 2 (sezon) = **120–160k wymian rocznie**.
- **Providerzy w mieście (estymata):**
  - Wulkanizacje stacjonarne: ~15–20.
  - Mobilne punkty: ~3–6 (mniejsze miasta = mniej mobilnych).
  - Warsztaty z dojazdową ofertą: ~2–5.
  - **Razem: ~20–30 podmiotów** (z czego realistycznie pozyskamy 15–20 na start).

**Segmentacja providerów:**

| Segment | Profil | Ilu w Nowym Sączu | Priorytet | Dlaczego |
|---|---|---:|---|---|
| **A — Mobilni solo** | Van + 1–2 osoby, aktywni w social media / OLX | 3–6 | **1 (najwyższy)** | Najbardziej cyfrowi, najbardziej boli ich „telefony od rana", natychmiastowe WOW z app |
| **B — Warsztaty z mobilnym dojazdem** | Stacjonarna wulkanizacja + usługa dojazdu | 2–5 | **2** | Mają infrastrukturę, ale logistyka mobilna chaotyczna |
| **C — Tradycyjne wulkanizacje** | Stały adres, brak digital, papierowy kalendarz | 10–15 | **3 (najniższy)** | Najtrudniejsi do przekonania, ale największa baza |

**Taktyka per segment:**
- **Segment A:** cold call + odwiedziny przy vanie; pokaż demo na tablecie; 80% konwersja.
- **Segment B:** spotkanie z właścicielem w warsztacie; pokaż jak app redukuje double-booking; 50% konwersja.
- **Segment C:** dopiero po zbudowaniu demand (gdy klienci pytają „czy jesteście na opony.app?"); 20% konwersja.

### 17.2. Value proposition per segment

**Segment A (mobilni solo) — one-liner:**
> „Przestań odbierać telefony od rana — klienci sami rezerwują godzinę, a Ty widzisz całą trasę dnia na jednym ekranie. Zero prowizji przez 3 miesiące."

**Segment B (warsztaty + dojazd) — one-liner:**
> „Dostajesz darmowy kalendarz online i stronę w Google — koniec z double-bookingiem i no-show'ami. Wypróbuj za darmo."

**Segment C (tradycyjne wulkanizacje) — one-liner (faza 2):**
> „Twoi klienci już używają opony.app — dołącz, żeby nie tracić ich na konkurencję. Rejestracja 10 minut, pomagamy przy wszystkim."

**Wspólne korzyści (w każdym wariancie):**
- Mniej telefonów → więcej czasu na pracę.
- Mniej no-show (system kar + przypomnienia SMS).
- Widoczność w Google (SEO-friendly profil publiczny).
- Zero ryzyka — 0% prowizji przez pilot.

### 17.3. Playbook outreach z szablonami

**Timeline:**

| Tydzień | Faza | Cel | Akcje |
|---:|---|---|---|
| −4 do −2 | Pre-launch | Lista providerów + research | Obdzwonienie Google Maps/OLX, Excel, segmentacja A/B/C |
| −2 do 0 | Pilot sign-up | 8 zaangażowanych (6×A + 2×B) | Osobiste wizyty, demo na tablecie, podpisanie |
| 1–4 | Post-launch | +6 (razem 14) | Outreach do reszty A + B; pierwsze referrale |
| 5–8 | Dociążenie | +4 (razem 18) | Referral program; segment C (jeśli demand rośnie) |
| 9–12 | Stabilizacja | 20 aktywnych | Retencja, optymalizacja, przygotowanie ekspansji |

**Szablon rozmowy telefonicznej (cold call, segment A):**

> *„Dzień dobry, [imię]? Tu [founder], dzwonię z opony.app — robimy aplikację do rezerwacji wymian opon. Zauważyłem Pana ogłoszenie na [OLX/Google] i chciałem zapytać: ile czasu dziennie traci Pan na odbieranie telefonów i umawianie klientów? (...)
> Bo właśnie to rozwiązujemy — klient sam wybiera godzinę w kalendarzu, Pan dostaje SMS, i tyle. Zero prowizji przez 3 miesiące. Czy mógłbym podjechać na 15 minut i pokazać na żywo? Jestem w Nowym Sączu, mogę dzisiaj/jutro."*

**Kluczowe zasady rozmowy:**
1. Zacznij od pytania o ból (ile telefonów? ile no-show?), nie od produktu.
2. Nie sprzedawaj — pokaż.
3. Demo na miejscu >> rozmowa telefoniczna.
4. Umów się na konkretną godzinę (nie „oddzwonię").

**Szablon cold-DM (Facebook/Messenger, segment A/B):**

> *„Cześć [imię]! Widziałem Twoje ogłoszenie [link]. Robię aplikację do wymiany opon — coś jak Booksy, ale dla wulkanizatorów. Testuję w Nowym Sączu i szukam 5 partnerów pilotażowych — 0% prowizji przez 3 mc, pomagam z wdrożeniem. Czy mogę podjechać na 15 min demo? 🙂"*

### 17.4. Incentywy + budżet

| Tier providera | Incentyw | Koszt jednostkowy |
|---|---|---:|
| Pierwszych 8 (pilot, segment A/B) | 0% prowizji 3 mc + featured w mapie + founder robi zdjęcia vana/warsztatu za darmo | ~0 PLN (utracona prowizja: ~800 PLN/provider × 3mc ≈ 2 400) |
| 9–15 | 0% prowizji 6 tygodni | ~600 PLN utracona prowizja/provider |
| 16–20 | 50% prowizji (4%) przez 6 tygodni | ~300 PLN/provider |
| Referral | 300 PLN za poleconego, który zrobi 5 rezerwacji | 300 PLN/referral |

**Budżet incentywów (estymata rok 1):**

| Pozycja | Szt. | Koszt (PLN) |
|---|---:|---:|
| Utracona prowizja (pilot 8 × 3mc + tier 2–3) | — | ~8 000 |
| Referrale (~8 × 300 PLN) | 8 | 2 400 |
| Materiały (ulotki, QR codes, wizytówki) | — | 1 000 |
| Paliwo na osobiste wizyty (3 mc intensywne) | — | 600 |
| **Razem budżet GTM B2B rok 1** | | **~12 000 PLN** |

⚠ **Do uwzględnienia w 16.7 runway** (dodatkowe 12k do setup/rok 1).

### 17.5. Onboarding playbook + TTFB

**Metryka kluczowa:** **TTFB (Time To First Booking)** — czas od aktywacji profilu do pierwszej rezerwacji klienta. **Cel: < 7 dni.** Jeśli > 14 dni → provider traci wiarę i odchodzi.

**Flow onboarding (tydzień 0 nowego providera):**

| Dzień | Co się dzieje | Odpowiedzialny |
|---:|---|---|
| 0 | Demo na miejscu (15–30 min). Provider mówi „tak". | Founder |
| 0 | Rejestracja NIP → GUS auto-fill (US-18). | Provider + founder |
| 0–1 | Upload zdjęć (founder robi fotki na miejscu jeśli trzeba). | Provider + founder |
| 1 | Admin approve (founder = admin, instant). | Founder |
| 1 | Regulamin + RODO (US-43). | Provider |
| 1–2 | Wizard: cennik + godziny + strefa (US-22 tutorial). | Provider + founder (shoulder-to-shoulder) |
| 2 | Profil AKTYWNY, widoczny klientom. | System |
| 2–7 | **Seed booking** (patrz 17.9) — founder generuje 1. rezerwację. | Founder |
| 7 | Call: „Jak poszło? Co zmienić?". | Founder |
| 14 | Check-in: ile rezerwacji? problemy? | Founder |
| 30 | NPS survey (1–10 + „co by Pan zmienił?"). | Email/SMS |

**Jeśli TTFB > 7 dni:**
1. Founder sam rezerwuje u providera (seed).
2. Founder pyta w sądeckich grupach FB „kto chce wymianę opon w [dzielnicy]? Polecam [provider] na opony.app" (organiczny seed).
3. Google Ads kampania lokalna z nazwą providera (1–2 dni, 50 PLN budżet).

### 17.6. Retention + churn + win-back

**Proaktywna retencja:**
1. **SLA akceptacji < 2h** — badge „Szybki Partner" w profilu publicznym.
2. **Miesięczny raport email**: ile rezerwacji, obrót z platformy, średnia ocena, ranking w mieście.
3. **WhatsApp grupa providerów** (Nowy Sącz) — pytania, porady, „co działa". Founder aktywny.
4. **Bezpośrednia linia do foundera** (telefon) przez pierwsze 6 mc — nie ticket, rozmowa.
5. **„Provider miesiąca"** — wyróżnienie w app + social media za najlepsze oceny.

**Wczesne sygnały churnu:**
- 0 rezerwacji w miesiącu → alert do foundera.
- Średni response time > 4h → ostrzeżenie email + telefon.
- Rating < 3.5 po 10+ ocenach → rozmowa z founderem o poprawie.

**Exit interview (gdy provider chce odejść):**
1. Telefon od foundera: „Co poszło nie tak?".
2. Zapis powodu do tabeli `ProviderChurnLog(providerId, date, reason, winBackAttempt)`.
3. Jeśli powód = brak klientów → seed demand + intensywniejszy marketing lokalny.
4. Jeśli powód = za dużo prowizji → jednorazowy 50% discount na 2 mc.

**Win-back (po 30 dniach od deaktywacji):**
- SMS: „Tęsknimy! Od Twojego odejścia [N] klientów szukało wymiany opon w [dzielnica]. Wróć — prowizja 4% przez 2 miesiące."
- Jeśli nie wróci w 60 dni → zamykamy rekord, lekcje do ChurnLog.

### 17.7. KPI GTM (tygodniowe + miesięczne)

**Tygodniowe cele outreach (faza 1–4, founder lub 1 osoba GTM):**

| Metryka | Cel/tydzień |
|---|---:|
| Telefonów / cold-DM | 15 |
| Demo (na żywo) | 4 |
| Sign-upy (NIP → PENDING) | 2 |
| Profili APPROVED | 2 |
| Pierwszych rezerwacji (seed) | 2 |

**Miesięczne KPI (dashboard):**

| KPI | Cel M3 | Cel M6 | Cel M12 |
|---|---:|---:|---:|
| Providerzy APPROVED | 12 | 18 | 20 |
| MAU providerów (≥1 rez/mc) | 8 | 14 | 18 |
| Rezerwacji/mc | 150 | 600 | 800 |
| Rez/provider/mc (średnia) | 12 | 33 | 40 |
| Średni TTFB (dni) | < 7 | < 5 | < 3 |
| Średni response time PENDING | < 2h | < 1,5h | < 1h |
| Provider churn (miesięczny) | < 15% | < 10% | < 5% |
| NPS providerów | > 20 | > 30 | > 40 |

### 17.8. Marketing do klientów (budżet + kanały)

**Budżet 3 000 PLN/mc (z 16.2) — rozbicie:**

| Kanał | % budżetu | PLN/mc | Cel |
|---|---:|---:|---|
| Google Ads (local search) | 40% | 1 200 | Intencja: „wymiana opon nowy sącz", „wulkanizator dojazd" |
| Facebook / Instagram Ads | 30% | 900 | Awareness: targetowanie Nowy Sącz + 20 km, wiek 25–55, motor. |
| SEO (content + techniczne) | 15% | 450 | Evergreen: „kiedy wymienić opony", „rozmiar opon [marka]" |
| Materiały offline (ulotki, QR) | 10% | 300 | Partnerstwa: myjnie, stacje, parkingi |
| Rezerwa / testy | 5% | 150 | A/B testy kreatywów, nowe kanały |

**Sezonowość marketingu:**
- **Szczyt (marzec–maj + wrzesień–listopad):** budżet ×2 = 6 000 PLN/mc (agresywne Google Ads + FB).
- **Poza szczytem (czerwiec–sierpień + grudzień–luty):** budżet ×0,5 = 1 500 PLN/mc (tylko SEO + retargeting).
- **Uśredniony roczny:** ~3 000 PLN/mc (zgodne z 16.2).

**SEO landingi miejskie:**
- `opony.app/nowy-sacz` — główna strona miasta.
- `opony.app/p/<slug>` — profil każdego providera (long tail).
- `opony.app/blog/kiedy-wymienic-opony` — evergreen content.
- `opony.app/blog/rozmiar-opon-ford-focus` — per-model content (SEO magnet).

**Partnerstwa lokalne:**
- Myjnie samochodowe (3–4 w mieście) → stojak z ulotkami + QR code „−10% na pierwszą wymianę z kodem MYJNIA".
- Stacje benzynowe (Orlen, BP) → ulotki na ladzie.
- Parkingi przy galeriach (Sądecka, Trzy Korony) → baner na bramkach.
- Lokalne serwisy (Facebook grupy, NewsSądecki, eSądeczanin) → artykuł sponsorowany.

### 17.9. Seed demand — strategia cold-start po stronie klientów

Największe ryzyko marketplace'u: provider zarejestrowany, ale **0 rezerwacji przez tydzień → rezygnuje**. Strategia seed demand:

**Taktyka 1: „Founder as first customer"**
- Founder sam rezerwuje wymianę opon u każdego nowego providera w ciągu 3 dni od aktywacji. Realny koszt: ~150–200 PLN × 20 providerów = ~3 000–4 000 PLN (ale opon i tak trzeba wymieniać — partialnie realny koszt).
- Efekt: provider przechodzi pełny flow, zgłasza bugi, czuje że platforma działa.

**Taktyka 2: „Friends & family"**
- Lista 20–30 osób z otoczenia foundera, które wymieniają opony w sezonie.
- SMS/WhatsApp: „Hej, robię aplikację do rezerwacji wulkanizatora. Umówisz się przez opony.app? Pierwsza wymiana −20 zł z kodem RODZINA."
- Cel: 20+ realnych rezerwacji w pierwszym miesiącu.

**Taktyka 3: „Lokalna grupa FB — oferta startowa"**
- Post w grupach: „Nowy Sącz — kierowcy! Testujemy apkę do rezerwacji wymiany opon (coś jak Booksy, ale na opony). Pierwszych 50 osób dostaje kod na −30 zł. Link: opony.app/nowy-sacz"
- Grupy: „Nowy Sącz", „Sądeczanie", „OLX Nowy Sącz", „Nowy Sącz kierowcy".
- Cel: viral w małym mieście (wszyscy się znają).

**Taktyka 4: „Google Ads — instant demand"**
- Kampania „wymiana opon nowy sącz" z budżetem 50 PLN/dzień przez pierwsze 2 tygodnie.
- CPC w małym mieście: ~1–3 PLN → 15–50 kliknięć/dzień.
- Konwersja 5% → 1–3 rezerwacje/dzień.
- Koszt: ~700 PLN na 14 dni.

**Taktyka 5: „Provider co-marketing"**
- Każdy nowy provider dostaje 50 wizytówek z QR i kodem „−20 zł" do rozdania swoim obecnym klientom.
- Provider zyskuje (jego klienci rezerwują przez app → mniej telefonów), platforma zyskuje (demand).

**Budżet seed demand:**

| Taktyka | Koszt (PLN) |
|---|---:|
| Founder as customer (realnie: opony) | ~3 000 |
| Friends & family kody (20 × 20 PLN) | 400 |
| Kody FB (50 × 30 PLN) | 1 500 |
| Google Ads sprint (14 dni × 50) | 700 |
| Wizytówki providerów (20 × 50 szt) | 500 |
| **Razem seed demand** | **~6 100 PLN** |

⚠ **Do uwzględnienia w 16.7 runway** (dodatkowe 6k do setup/rok 1).

### 17.10. Timeline GTM zsynchronizowany z dev

| Tydzień | Dev | GTM (B2B) | GTM (klienci) |
|---:|---|---|---|
| 1–2 | Sprint 1: auth + profil + DB | Research: Excel providerów; obdzwanianie | — |
| 3–4 | Sprint 2: wyszukiwarka + mapa + katalog | Wizyty segment A (5–8 demo) | Landing page opony.app/nowy-sacz |
| 5–6 | Sprint 3: rezerwacja + SMS | Sign-up pilotażowych providerów (8) | SEO setup, blog 3 artykuły |
| **7** | **MVP v0 soft-launch (internal)** | **Onboarding 8 providerów** (shoulder-to-shoulder) | **Friends & family seed (20 rezerwacji)** |
| 8 | Bug-fix sprint + polish | Kolejni sign-upy (+4) | FB grupy + Google Ads sprint |
| **9** | **MVP v0 public launch** | **12 aktywnych providerów** | **Kampania: „Nowy Sącz wymienia opony online"** |
| 10–12 | Iteracja: feedback loop | +6 providerów (tier 2–3) | Retargeting + partnerstwa lokalne |
| **12** | **Podsumowanie pilotu** | **~18–20 providerów** | **~150–200 rez/mc target** |

**Kluczowe momenty synchronizacji:**
- **Tydzień 7 (soft-launch):** Dev + GTM razem — providerzy są na platformie, ale ruch tylko z seed demand. Czas na bug-fix bez presji.
- **Tydzień 9 (public launch):** Kampania marketingowa startuje DOPIERO gdy platforma jest stabilna i providerzy przetrenowani.
- **Nie odwrotnie:** nigdy nie puszczamy kampanii klientom zanim providerzy nie przeszli pełnego onboardingu.

