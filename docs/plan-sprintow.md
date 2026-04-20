# Plan sprintów i backlog — Opony.app

> 58 user stories, 139 SP MUST, zespół 4 os. × 7 tygodni. Miasto pilotażowe: Nowy Sącz.

## 7. Plan rozwoju (fazy)

| Faza | Zakres | Cel |
|---|---|---|
| **0. Discovery** | Wywiady z 5 warsztatami + 5 mobilnymi + 20 kierowcami | Walidacja problemu, ceny prowizji |
| **1. Prototyp** | Figma: 10 kluczowych ekranów (klient + B2B) | Test na 10 użytkownikach |
| **2. MVP v0.1** | Klient + B2B, 1 miasto pilot (Nowy Sącz), płatności P24 | 20 usługodawców, 150 rezerwacji/mc |
| **3. MVP v1.0** | RN apki, push, warsztaty stacjonarne, Stripe fallback | Komercyjny launch w 3 miastach |
| **4. Skalowanie** | Kolejne miasta, optymalizacja tras, abonamenty | 5 miast, 500 usługodawców |
| **5. Rozszerzenie** | Przechowywanie opon, geometria, integracja z Oponeo | Cross-sell |


---

## 12. Wireframe'y tekstowe (MVP v0)

### 12.1. Klient: Ekran główny — lista punktów

```
┌──────────────────────────────────┐
│ ≡  Opony.app           🔔  👤   │
├──────────────────────────────────┤
│ 📍 Nowy Sącz Centrum  [zmień]   │
│ 🚗 205/55 R16 [Ford Focus 2019] │
├──────────────────────────────────┤
│ 🔍 Szukaj nazwy lub ulicy...    │
├──────────────────────────────────┤
│ [🗺 Mapa] [📋 Lista ✓]          │
├──────────────────────────────────┤
│ [Dziś] [Jutro] [Weekend]  ▼ Cena│
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ 🚐 MobilOpony Kasia          │ │
│ │ ⭐ 4.8 (127)  •  2.1 km      │ │
│ │ 💰 180 zł / wymiana 4 opon   │ │
│ │ ⏰ Najbliższy: Dziś 16:30    │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ 🚐 Szybka Wymiana            │ │
│ │ ⭐ 4.5 (43)   •  3.8 km      │ │
│ │ 💰 200 zł / wymiana 4 opon   │ │
│ │ ⏰ Najbliższy: Jutro 9:00    │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│  🔍 Szukaj    📋 Rezerwacje  👤  │ ← bottom tab bar
└──────────────────────────────────┘
```

**Stany specjalne:** pusta lista (miasto niewspierane), brak lokalizacji (fallback na wybór miasta), loading (skeleton cards), brak pojazdu (widełki cen + CTA „Dodaj pojazd").

### 12.2. Klient: Karta punktu

```
┌──────────────────────────────────┐
│ ←  MobilOpony Kasia        ♡    │
├──────────────────────────────────┤
│ [ zdjęcia — carousel ]           │
├──────────────────────────────────┤
│ ⭐ 4.8 (127 opinii)              │
│ 🚐 Mobilny punkt wymiany        │
│ 📍 Obsługuje: Nowy Sącz (do 15 km) │
│ 🕐 Pn–Pt 8:00–18:00, Sb 9–14    │
├──────────────────────────────────┤
│ 💰 CENNIK (wymiana 4 opon)      │
│   ≤ 15"        140 zł            │
│   16" – 17"    180 zł            │
│   ≥ 18"        240 zł            │
│   + dojazd 0 zł (do 10 km)       │
├──────────────────────────────────┤
│ 📝 O nas                         │
│   8 lat doświadczenia, van...   │
├──────────────────────────────────┤
│ ⭐ OPINIE                        │
│   Marek K. ⭐⭐⭐⭐⭐              │
│   "Szybko, sprawnie, polecam"    │
│   [zobacz wszystkie →]          │
├──────────────────────────────────┤
│ ╔══════════════════════════════╗ │
│ ║  [📅 Zarezerwuj termin]      ║ │ ← sticky CTA
│ ╚══════════════════════════════╝ │
└──────────────────────────────────┘
```

### 12.3. Klient: Wybór slotu (kalendarz)

```
┌──────────────────────────────────┐
│ ←  Wybierz termin                │
│    ● Adres  ● Termin  ○ Płatność │ ← step indicator (2/3)
├──────────────────────────────────┤
│ 🚗 205/55 R16 • 180 zł          │
│ 📍 ul. Lwowska 12, Nowy Sącz    │
│    [zmień adres]                 │
├──────────────────────────────────┤
│  Kwi  ‹  14  ›  Pon              │
│  Pn Wt Śr Cz Pt Sb Nd            │
│ [14][15][16][17][18] 19 20       │ ← nawigacja dni (weekend greyed)
├──────────────────────────────────┤
│ DOSTĘPNE GODZINY                 │
│ Rano                             │
│   [ 08:00 ] [ 08:45 ]  [ 9:30 ]  │
│   [ 10:15 ✓ ]                    │ ← wybrany
│ Popołudnie                       │
│   [ 13:00 ] [ 13:45 ]            │
│   [ 14:30 zajęte ]               │ ← disabled
│ Wieczór                          │
│   [ 16:00 ] [ 16:45 ]            │
├──────────────────────────────────┤
│ Podsumowanie:                    │
│   Pon 14 kwi, 10:15–11:00 (~45m) │
│   MobilOpony Kasia → Twój adres  │
│   Razem: 180 zł                  │
├──────────────────────────────────┤
│ ╔══════════════════════════════╗ │
│ ║ 💳 Zapłać i zarezerwuj 180zł ║ │ ← redirect do P24
│ ╚══════════════════════════════╝ │
└──────────────────────────────────┘
```

**Edge cases:** brak wolnych slotów w dniu (komunikat + sugestia dnia), adres poza strefą (walidacja inline), race condition (409 → „ten slot właśnie zajęto, wybierz inny").

### 12.4. Klient: Rezerwacja potwierdzona

```
┌──────────────────────────────────┐
│          ✅                       │
│   Rezerwacja potwierdzona!       │
│    ● Adres  ● Termin  ● Płatność │ ← step indicator (3/3 done)
├──────────────────────────────────┤
│ Kod: OPN-4F2K                    │
│                                  │
│ 📅 Pon 14 kwi, 10:15 (~45 min)   │
│ 🚐 MobilOpony Kasia              │
│ 📍 ul. Lwowska 12, Nowy Sącz    │
│ 💳 180 zł — BLIK ✅ opłacone     │
│                                  │
│ SMS z potwierdzeniem wysłany     │
│ na +48 *** *** 345               │
│                                  │
│ ℹ Anulowanie > 2h przed =        │
│   pełny zwrot na konto           │
│                                  │
│ [📅 Dodaj do kalendarza]         │
│ [✗ Anuluj rezerwację]            │
│ [← Wróć do listy]               │
└──────────────────────────────────┘
```

### 12.5. B2B: Dashboard dnia

```
┌─────────────────────────────────────────────────────────────┐
│ MobilOpony Kasia           [+ Wizyta ręcznie]         👤   │
├─────────────┬───────────────────────────────────────────────┤
│ ≡ MENU      │ 📅 Dziś — 14 kwietnia 2026                    │
│             │                                               │
│ • Dzień     │ 5 wizyt • Brutto: 920 zł • Netto: 846 zł     │
│ • Kalendarz │ 💰 Do wypłaty (pon): 2 340 zł                 │
│ • Klienci   │                                               │
│ • Cennik    │ ┌───────────────────────────────────────────┐ │
│ • Godziny   │ │ 08:00–08:45  Jan Nowak           180 zł  │ │
│ • Strefa    │ │ ul. Jagiellońska 12 · 1.2 km             │ │
│ • Opinie 🔴2│ │ [🧭 Nawiguj]  [▶ Rozpocznij]             │ │
│ • Finanse   │ │ CONFIRMED  💳✅                           │ │
│ • Ustawienia│ └───────────────────────────────────────────┘ │
│             │ ┌───────────────────────────────────────────┐ │
│             │ │ 09:30–10:15  Marek K.            180 zł  │ │
│             │ │ ul. Lwowska 5 · 2.4 km               │ │
│             │ │ [🧭 Nawiguj]  [▶ Rozpocznij]             │ │
│             │ │ CONFIRMED                                │ │
│             │ └───────────────────────────────────────────┘ │
│             │ ┌───────────────────────────────────────────┐ │
│             │ │ ⚠ 11:00–11:45  Anna W.          140 zł  │ │
│             │ │ ul. Długosza 88 · 3.8 km             │ │
│             │ │ PENDING — oczekuje akceptacji            │ │
│             │ │ [✓ Akceptuj] [✗ Odrzuć]                  │ │
│             │ └───────────────────────────────────────────┘ │
└─────────────┴───────────────────────────────────────────────┘
```

### 12.6. B2B: Szczegół rezerwacji

```
┌─────────────────────────────────────────────────────────────┐
│ ← Rezerwacja OPN-4F2K                                       │
├─────────────────────────────────────────────────────────────┤
│ STATUS: CONFIRMED                                           │
│                                                             │
│ 📅 Pon 14 kwi 2026, 10:15–11:00 (~45 min)                  │
│ 🚗 Ford Focus 2019 · 205/55 R16                            │
│                                                             │
│ 👤 Marek K. · +48 *** *** 456 (tap = połącz)               │
│ 📍 ul. Lwowska 5/12, Nowy Sącz                             │
│ 📝 "Proszę dzwonić przed przyjazdem"                        │
├─────────────────────────────────────────────────────────────┤
│ 💰 PŁATNOŚĆ                                                 │
│   Wymiana 4 opon:  180 zł                                   │
│   Dojazd:            0 zł                                   │
│   ─────────────────────────                                 │
│   Klient zapłacił:  180 zł  (BLIK ✅)                       │
│   Prowizja 8%:     −14,40 zł                                │
│   Twoja wypłata:   165,60 zł (w pon.)                       │
├─────────────────────────────────────────────────────────────┤
│ 📋 HISTORIA                                                 │
│   wczoraj 18:42 — Klient zarezerwował                       │
│   wczoraj 18:42 — Płatność BLIK potwierdzona                │
│   wczoraj 18:50 — Zaakceptowano (Ty)                        │
├─────────────────────────────────────────────────────────────┤
│ [▶ Rozpocznij]  [🔄 Zmień termin]  [✗ Anuluj]              │
│ (po startAt: [⚠ Klient się nie pojawił])                    │
└─────────────────────────────────────────────────────────────┘
```

### 12.7. B2B: Edycja cennika i godzin

```
┌─────────────────────────────────────────────────────────────┐
│ CENNIK                                                       │
├─────────────────────────────────────────────────────────────┤
│ Cena wymiany 4 opon:                                         │
│   ≤ 15 cali      [140] zł                                    │
│   16–17 cali     [180] zł                                    │
│   ≥ 18 cali      [240] zł                                    │
│                                                              │
│ Dopłaty:                                                     │
│   Dojazd 0–10 km    [  0] zł                                │
│   Dojazd 10–15 km   [ 30] zł                                │
│   Wyważanie         [ 20] zł / koło                         │
│                                                              │
│ [ Zapisz ]                                                   │
├─────────────────────────────────────────────────────────────┤
│ GODZINY PRACY                                                │
│   Pon  [08:00]–[18:00]    Czas slotu: [45] min              │
│   Wt   [08:00]–[18:00]                                       │
│   Śr   [08:00]–[18:00]                                       │
│   Cz   [08:00]–[18:00]                                       │
│   Pt   [08:00]–[18:00]                                       │
│   Sb   [09:00]–[14:00]                                       │
│   Nd   [ nieczynne ]                                          │
│                                                              │
│ Wyjątki: [ + Dodaj urlop / święto ]                          │
│                                                              │
│ [ Zapisz ]                                                   │
├─────────────────────────────────────────────────────────────┤
│ STREFA OBSŁUGI                                               │
│   Centrum: [ Nowy Sącz Rynek ▼ ]                                │
│   Promień: [15] km                                           │
│   [ podgląd na mapie ]                                        │
└─────────────────────────────────────────────────────────────┘
```


### 12.8. Klient: Płatność (redirect P24 + powrót)

```
┌──────────────────────────────────┐
│    ● Adres  ● Termin  ◉ Płatność │ ← step 3/3
├──────────────────────────────────┤
│                                  │
│   ⏳ Przekierowuję do            │
│      Przelewy24...               │
│                                  │
│   ┌────────────────────────────┐ │
│   │  Wybierz metodę płatności: │ │
│   │                            │ │
│   │  [  BLIK  ]  (rekomend.)  │ │
│   │  [ Karta Visa/MC ]        │ │
│   │  [ Przelew ekspresowy ]   │ │
│   └────────────────────────────┘ │
│                                  │
│   💰 Do zapłaty: 180,00 zł      │
│   Za: Wymiana opon, MobilOpony K.│
│                                  │
│   🔒 Płatność obsługiwana przez  │
│      Przelewy24. Twoje dane      │
│      karty nie trafiają do nas.  │
│                                  │
│   [← Anuluj i wróć]             │
└──────────────────────────────────┘

── Po wybraniu BLIK ──

┌──────────────────────────────────┐
│        Wpisz kod BLIK            │
│                                  │
│       ┌─┬─┬─┬─┬─┬─┐             │
│       │_│_│_│_│_│_│             │
│       └─┴─┴─┴─┴─┴─┘             │
│                                  │
│   Potwierdź w aplikacji banku    │
│   ⏱ Pozostało: 1:48              │
│                                  │
│   [Anuluj]                       │
└──────────────────────────────────┘

── Po sukcesie (redirect back) ──

┌──────────────────────────────────┐
│       ✅ Płatność przyjęta!       │
│                                  │
│   Przekierowuję do potwierdzenia │
│   rezerwacji...                  │
│                                  │
│   [automatyczny redirect → 12.4] │
└──────────────────────────────────┘
```

**Stany błędów:** timeout BLIK (120 s) → „Czas na BLIK minął. [Spróbuj ponownie]". Odrzucenie banku → „Płatność odrzucona. Spróbuj inną metodę." Błąd P24 → „Wystąpił błąd. Slot jest zarezerwowany przez 15 min — [Ponów płatność]."

### 12.9. Klient: Moje rezerwacje (lista)

```
┌──────────────────────────────────┐
│ ←  Moje rezerwacje               │
├──────────────────────────────────┤
│ [Nadchodzące ✓]  [Historia]      │ ← tabs
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ 📅 Pon 14 kwi, 10:15         │ │
│ │ 🚐 MobilOpony Kasia          │ │
│ │ 📍 ul. Lwowska 12            │ │
│ │ 💰 180 zł  💳✅               │ │
│ │ ┌─────────────────────────┐  │ │
│ │ │ CONFIRMED               │  │ │ ← zielony badge
│ │ └─────────────────────────┘  │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ 📅 Śr 16 kwi, 14:00          │ │
│ │ 🚐 Szybka Wymiana            │ │
│ │ 📍 ul. Długosza 88           │ │
│ │ 💰 200 zł  💳⏳               │ │
│ │ ┌─────────────────────────┐  │ │
│ │ │ PENDING (oczekuje)      │  │ │ ← żółty badge
│ │ └─────────────────────────┘  │ │
│ └──────────────────────────────┘ │
│                                  │
│ ── Historia ──                   │
│ (widoczne po kliknięciu tab)     │
│ COMPLETED, CANCELLED, NO_SHOW   │
│ + CTA „Oceń" dla nieocenionych   │
├──────────────────────────────────┤
│  🔍 Szukaj    📋 Rezerwacje  👤  │
└──────────────────────────────────┘
```

**Pusta lista:** ilustracja + „Nie masz jeszcze rezerwacji. [Znajdź punkt →]"

### 12.10. Klient: Szczegół rezerwacji

```
┌──────────────────────────────────┐
│ ←  Rezerwacja OPN-4F2K           │
├──────────────────────────────────┤
│ ┌────────────────────────────┐   │
│ │ CONFIRMED                  │   │ ← badge kolorem
│ └────────────────────────────┘   │
│                                  │
│ 📅 Pon 14 kwi 2026, 10:15       │
│    (~45 min)                     │
│ 🚐 MobilOpony Kasia [profil →]  │
│ 📍 ul. Lwowska 12, Nowy Sącz    │
│ 🚗 Ford Focus 2019 · 205/55 R16 │
│ 📝 "Proszę dzwonić przed"       │
├──────────────────────────────────┤
│ 💳 Płatność: BLIK ✅ 180 zł      │
│ ℹ Anulowanie > 2h = pełny zwrot │
├──────────────────────────────────┤
│ 📋 Status:                       │
│   13 kwi 18:42 — Zarezerwowano   │
│   13 kwi 18:42 — BLIK opłacone  │
│   13 kwi 18:50 — Provider OK    │
├──────────────────────────────────┤
│ [📅 Dodaj do kalendarza]         │
│ [🔄 Zmień termin]                │
│ [✗ Anuluj rezerwację]            │
├──────────────────────────────────┤
│  🔍 Szukaj    📋 Rezerwacje  👤  │
└──────────────────────────────────┘

── Dla statusu COMPLETED ──

│ [⭐ Oceń wizytę]                  │ ← CTA jeśli brak oceny
│ [Zobacz moją ocenę]              │ ← jeśli już ocenione
```

### 12.11. Klient: Profil + pojazdy

```
┌──────────────────────────────────┐
│ ←  Mój profil                    │
├──────────────────────────────────┤
│ 👤 Marek Kowalski                │
│ 📱 +48 *** *** 345               │
│ ✉  marek@example.com             │
│ 📍 ul. Lwowska 12, Nowy Sącz    │
│    [Edytuj profil]               │
├──────────────────────────────────┤
│ 🚗 MOJE POJAZDY                  │
│ ┌──────────────────────────────┐ │
│ │ Ford Focus żony              │ │
│ │ 205/55 R16                   │ │
│ │ [Edytuj]  [Usuń]            │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ Skoda Octavia               │ │
│ │ 225/45 R17                   │ │
│ │ [Edytuj]  [Usuń]            │ │
│ └──────────────────────────────┘ │
│ [+ Dodaj pojazd]                 │
├──────────────────────────────────┤
│ ♡ Ulubione punkty (2)   [→]     │
├──────────────────────────────────┤
│ ⚙ USTAWIENIA                     │
│ [Zmień numer telefonu]           │
│ [Pobierz moje dane (RODO)]      │
│ [Usuń konto]                     │
│ [Wyloguj]                        │
├──────────────────────────────────┤
│  🔍 Szukaj    📋 Rezerwacje  👤  │
└──────────────────────────────────┘
```

### 12.12. Klient: Ocena wizyty

```
┌──────────────────────────────────┐
│ ←  Oceń wizytę                   │
├──────────────────────────────────┤
│ 🚐 MobilOpony Kasia              │
│ 📅 Pon 14 kwi 2026               │
│ Kod: OPN-4F2K                    │
├──────────────────────────────────┤
│                                  │
│   Jak oceniasz wizytę?           │
│                                  │
│   ☆ ☆ ☆ ☆ ☆                     │ ← tapnij gwiazdkę
│   (po wyborze: ★★★★☆ = 4/5)     │
│                                  │
├──────────────────────────────────┤
│   Twój komentarz (opcjonalnie):  │
│   ┌────────────────────────────┐ │
│   │ Szybko, sprawnie, polecam! │ │
│   │                            │ │
│   │                            │ │
│   └────────────────────────────┘ │
│   324 / 1000 znaków              │
├──────────────────────────────────┤
│ ╔══════════════════════════════╗ │
│ ║     [ Wyślij ocenę ]        ║ │
│ ╚══════════════════════════════╝ │
│ [Pomiń — oceń później]           │
└──────────────────────────────────┘
```

### 12.13. Klient: Widok mapy

```
┌──────────────────────────────────┐
│ ≡  Opony.app           🔔  👤   │
├──────────────────────────────────┤
│ 🔍 Szukaj nazwy lub ulicy...    │
├──────────────────────────────────┤
│ [🗺 Mapa ✓] [📋 Lista]          │
├──────────────────────────────────┤
│ [Dziś] [Jutro] [Weekend]  ▼ Cena│
├──────────────────────────────────┤
│                                  │
│   ┌─────────────────────────┐    │
│   │         MAPA            │    │
│   │                         │    │
│   │    📍(Ja)               │    │
│   │              🚐 4.8     │    │ ← pin z oceną
│   │   🚐 4.5               │    │
│   │                  🚐 4.2 │    │
│   │                         │    │
│   └─────────────────────────┘    │
│                                  │
│ ── Mini-karta (po tap na pin) ── │
│ ┌──────────────────────────────┐ │
│ │ 🚐 MobilOpony Kasia          │ │
│ │ ⭐ 4.8  •  180 zł  •  2.1 km │ │
│ │ [Zobacz profil →]            │ │
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│  🔍 Szukaj    📋 Rezerwacje  👤  │
└──────────────────────────────────┘
```

### 12.14. B2B: Finanse (wypłaty)

```
┌─────────────────────────────────────────────────────────────┐
│ ←  Finanse                                                   │
├─────────────────────────────────────────────────────────────┤
│ 💰 SALDO                                                    │
│   Do wypłaty (pon. 21 kwi): 2 340,60 zł                    │
│   Konto: PL** **** **** **** **** 7890  [zmień]            │
├─────────────────────────────────────────────────────────────┤
│ 📊 TEN MIESIĄC (kwiecień 2026)                              │
│   Rezerwacji:     32                                         │
│   Brutto:         5 760 zł                                   │
│   Prowizja (8%):   −460,80 zł                               │
│   Netto:          5 299,20 zł                                │
├─────────────────────────────────────────────────────────────┤
│ 📋 HISTORIA WYPŁAT                                           │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 14 kwi 2026 (pon)   +1 656,00 zł   12 rezerwacji      │ │
│ │ [Szczegóły →]                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │  7 kwi 2026 (pon)   +1 324,80 zł    9 rezerwacji      │ │
│ │ [Szczegóły →]                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [📧 Wyślij podsumowanie na email]                           │
└─────────────────────────────────────────────────────────────┘
```

### 12.15. B2B: Onboarding wizard (3 kroki)

```
── Krok 1/3: Firma ──

┌─────────────────────────────────────────────────────────────┐
│        Zarejestruj firmę          ● ○ ○                      │
├─────────────────────────────────────────────────────────────┤
│ ☑ Akceptuję regulamin platformy (8% prowizji)              │
│ ☑ Akceptuję politykę prywatności (RODO)                    │
│ ☐ Zgoda na komunikację marketingową (opcjonalna)           │
├─────────────────────────────────────────────────────────────┤
│ NIP: [   6 3 1 0 1 2 3 4 5 6   ]                           │
│      ✅ GUS: MobilOpony Katarzyna Nowak                     │
│      ul. Jagiellońska 45, 33-300 Nowy Sącz                 │
│      JDG, PKD: 45.20.Z ✅                                  │
├─────────────────────────────────────────────────────────────┤
│ Telefon: [ +48 *** *** 789 ]                                │
│ Email:   [ kasia@mobilopony.pl ] ← link verify wyślemy     │
│ Hasło:   [ ●●●●●●●●●● ]  (min. 10 znaków)                 │
│ Nr konta: [ PL __ ____ ____ ____ ____ ____ ] (do wypłat)    │
├─────────────────────────────────────────────────────────────┤
│ ╔═════════════════════════════════════════════════════════╗ │
│ ║              [ Dalej → Zdjęcia ]                        ║ │
│ ╚═════════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────┘

── Krok 2/3: Materiały ──

┌─────────────────────────────────────────────────────────────┐
│        Wgraj zdjęcia              ● ● ○                      │
├─────────────────────────────────────────────────────────────┤
│ Potrzebujemy min. 3 zdjęć:                                  │
│                                                             │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐                     │
│ │ 📷       │ │ 📷       │ │ 📷       │                     │
│ │  Logo /  │ │  Van /   │ │ Stanow.  │                     │
│ │  awatar  │ │  pojazd  │ │  pracy   │                     │
│ │ [Wgraj]  │ │ [Wgraj]  │ │ [Wgraj]  │                     │
│ └──────────┘ └──────────┘ └──────────┘                     │
│                                                             │
│ JPG lub PNG, max 5 MB / zdjęcie                             │
│                                                             │
│ ╔═════════════════════════════════════════════════════════╗ │
│ ║           [ Dalej → Weryfikacja ]                       ║ │
│ ╚═════════════════════════════════════════════════════════╝ │
└─────────────────────────────────────────────────────────────┘

── Krok 3/3: Weryfikacja ──

┌─────────────────────────────────────────────────────────────┐
│        Weryfikacja                ● ● ●                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           ⏳                                                 │
│   Twoje zgłoszenie jest                                     │
│   w trakcie weryfikacji!                                    │
│                                                             │
│   Sprawdzimy Twoje dane                                     │
│   w ciągu 24 godzin.                                        │
│                                                             │
│   Dostaniesz SMS + email                                    │
│   gdy konto będzie aktywne.                                  │
│                                                             │
│   W międzyczasie sprawdź                                    │
│   skrzynkę email — wysłaliśmy                               │
│   link do weryfikacji adresu.                               │
│                                                             │
│ [← Wróć na stronę główną]                                   │
└─────────────────────────────────────────────────────────────┘
```

### 12.16. Klient: OTP + regulamin (first-time)

```
── Ekran logowania ──

┌──────────────────────────────────┐
│                                  │
│        🔧 Opony.app              │
│   Wymiana opon bez dzwonienia    │
│                                  │
│   Podaj numer telefonu:          │
│   ┌────────────────────────────┐ │
│   │ +48  *** *** ***           │ │
│   └────────────────────────────┘ │
│                                  │
│   ╔══════════════════════════╗   │
│   ║   [ Wyślij kod SMS ]     ║   │
│   ╚══════════════════════════╝   │
│                                  │
│   Logując się akceptujesz        │
│   regulamin i politykę prywat.   │
└──────────────────────────────────┘

── Wpisywanie kodu OTP ──

┌──────────────────────────────────┐
│ ←                                │
│                                  │
│   Wpisz kod z SMS                │
│   Wysłany na +48 *** *** 345     │
│                                  │
│      ┌─┬─┬─┬─┬─┬─┐              │
│      │4│2│8│_│_│_│              │
│      └─┴─┴─┴─┴─┴─┘              │
│                                  │
│   Kod ważny 5 minut              │
│   [Wyślij ponownie] (za 0:47)   │
│                                  │
│   3 próby pozostały              │
└──────────────────────────────────┘

── Zgody (tylko przy pierwszym logowaniu) ──

┌──────────────────────────────────┐
│                                  │
│   Zanim zaczniesz:               │
│                                  │
│   ☑ Akceptuję regulamin         │
│     platformy Opony.app         │
│     [czytaj →]                   │
│                                  │
│   ☑ Akceptuję politykę          │
│     prywatności (RODO)           │
│     [czytaj →]                   │
│                                  │
│   ☐ Chcę otrzymywać oferty      │
│     i promocje (opcjonalne)      │
│                                  │
│   ╔══════════════════════════╗   │
│   ║    [ Kontynuuj ]         ║   │
│   ╚══════════════════════════╝   │
└──────────────────────────────────┘
```

### 12.17. Klient: Lista opinii (pełna z rozkładem)

```
┌──────────────────────────────────┐
│ ←  Opinie: MobilOpony Kasia      │
├──────────────────────────────────┤
│ ⭐ 4.8  (127 opinii)             │
│                                  │
│ 5⭐ ████████████████████░  82%   │
│ 4⭐ ████░░░░░░░░░░░░░░░░  10%   │
│ 3⭐ █░░░░░░░░░░░░░░░░░░░   4%   │
│ 2⭐ ░░░░░░░░░░░░░░░░░░░░   2%   │
│ 1⭐ ░░░░░░░░░░░░░░░░░░░░   2%   │
├──────────────────────────────────┤
│ Filtr: [Wszystkie] [5⭐][4⭐]... │
│ Sortuj: ▼ Najnowsze             │
├──────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ Marek K.  ★★★★★  2 dni temu │ │
│ │ ✓ Zweryfikowany klient       │ │
│ │ "Szybko, sprawnie, polecam!  │ │
│ │  Przyjechał 5 min przed      │ │
│ │  czasem."                    │ │
│ │                              │ │
│ │ ↳ MobilOpony Kasia:          │ │
│ │   "Dziękujemy! Zapraszamy    │ │
│ │    ponownie 🙂"              │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ Anna W.  ★★★★☆  1 tydz temu │ │
│ │ ✓ Zweryfikowany klient       │ │
│ │ "Dobrze, ale 10 min          │ │
│ │  spóźnienia."                │ │
│ └──────────────────────────────┘ │
│                                  │
│ [Załaduj więcej]                 │
└──────────────────────────────────┘
```

---

## 15. Backlog user stories (MVP v0)

Format: **[ID] Jako X chcę Y aby Z** → Kryteria akceptacji → Priorytet (MoSCoW) → Szacunek (SP, Fibonacci).

### 15.1. Epic: Autentykacja i profil klienta

**[US-01]** Jako kierowca chcę zalogować się numerem telefonu przez SMS aby uniknąć zapamiętywania hasła.
- KA: Podaję numer → 6-cyfrowy kod SMS w < 30 s → po wpisaniu kodu jestem zalogowany.
- KA: Kod ważny 5 min; timeout → „Kod wygasł, wyślij nowy".
- KA: Resend button z countdown 60 s (anty-spam).
- KA: Rate limit: max 3 requesty OTP / 15 min / phone.
- KA: Po 3 błędnych próbach kodu → blokada phone na 15 min.
- KA: Sesja 30 dni (refresh token JWT); access token 15 min.
- KA: Logout dostępny w menu; akcja „Wyloguj wszędzie" (unieważnia wszystkie refresh tokens).
- KA: Jednoczesne sesje na wielu urządzeniach dozwolone.
- MUST · 5 SP

**[US-45]** Jako nowy klient muszę zaakceptować regulamin i zgody RODO aby móc korzystać z usługi.
- KA: Pierwszy ekran po pomyślnym OTP (US-01) dla nowego użytkownika — zgody:
  - Regulamin platformy (obowiązkowy).
  - Polityka prywatności / zgoda RODO (obowiązkowa).
  - Marketing (opcjonalna, opt-in domyślnie wyłączony).
- KA: Brak 2 obowiązkowych zgód → dostęp do app zablokowany (ekran przytrzymany).
- KA: Zapis timestamp + IP + wersja regulaminu w `ConsentLog` (ślad audytowy).
- KA: Przy zmianie wersji regulaminu — re-akceptacja przy kolejnym logowaniu.
- MUST · 2 SP

**[US-02]** Jako kierowca chcę uzupełnić profil aby nie wpisywać tych samych danych przy każdej rezerwacji.
- KA: Pola: imię, nazwisko, opcjonalny email (do powiadomień email + komunikacji).
- KA: Opcjonalny adres domowy (ulica, miasto, kod pocztowy) — z geocodingiem; służy jako **domyślny adres** przy rezerwacji mobilnej (US-08b).
- KA: Profil można uzupełnić częściowo i dokończyć później (bez blokady).
- KA: Rozmiar opon **nie jest** w profilu użytkownika — zarządzany w encji Vehicle (US-03).
- MUST · 3 SP

**[US-03]** Jako kierowca chcę zapisać moje pojazdy aby system znał rozmiary opon i nie pytał przy każdej rezerwacji.
- KA: Minimum 1 pojazd wymagany do złożenia rezerwacji (rozmiar opon ↔ cennik providera).
- KA: Formularz: nickname (opcjonalny, np. „Ford Focus żony"), rozmiar opon w formacie `205/55 R16` (walidacja regex).
- KA: Wiele pojazdów → lista w profilu; przy rezerwacji wybór pojazdu, jeśli > 1.
- KA: Edycja i usunięcie pojazdu.
- KA: Usunięcie blokowane, jeśli pojazd ma aktywne rezerwacje (PENDING / CONFIRMED / IN_PROGRESS).
- MUST · 3 SP

**[US-47]** Jako kierowca chcę zmienić numer telefonu aby zachować konto po zmianie SIM.
- KA: W ustawieniach profilu: „Zmień numer".
- KA: Flow: podaj nowy numer → OTP na **stary** numer (weryfikacja właściciela konta) → OTP na **nowy** numer (weryfikacja dostępu) → zapis zmiany.
- KA: Zapis historii zmian w `AuditLog`.
- KA: Fallback gdy stary numer niedostępny (zagubiony telefon) → mailto do kontakt@opony.app; admin zmienia ręcznie po weryfikacji tożsamości.
- SHOULD · 2 SP

**[US-46]** Jako kierowca chcę usunąć moje konto i pobrać swoje dane aby zrealizować prawa z RODO.
- KA: W ustawieniach profilu: „Usuń moje konto".
- KA: Dialog potwierdzający z informacją: „Imię/telefon/email zostaną usunięte, pojazdy skasowane; rezerwacje pozostaną w zanonimizowanej formie dla rozliczeń".
- KA: Po potwierdzeniu: imię → `[anonimowy]`, phone/email wymazane, `Vehicle` — usunięte; `Booking.clientId` pozostaje z flagą `isAnonymized`.
- KA: Soft delete — 30 dni okno na przywrócenie przez admina (Retool).
- KA: W ustawieniach „Pobierz moje dane" (eksport RODO) — v0: mailto do kontakt@opony.app z prefill tematu „Eksport danych — [userId]"; admin realizuje w ciągu 14 dni zgodnie z RODO.
- KA: v1 — automatyczny eksport JSON (download link w email).
- MUST · 2 SP

### 15.2. Epic: Wyszukiwanie i wybór usługodawcy

**[US-38]** Jako kierowca chcę, żeby app wykryła moją lokalizację aby nie wpisywać miasta ręcznie.
- KA: Pierwszy request lokalizacji → browser Geolocation API (prompt UI).
- KA: Zgoda → pobranie lat/lng → wyszukanie providerów w 15 km.
- KA: Brak zgody lub błąd → dropdown „Wybierz miasto" (v0: lista tylko z Poznaniem; jeśli brak dostępnych → info + waitlist — patrz US-40).
- KA: Ostatni wybór miasta zapisany w localStorage — brak kolejnego promptu przy następnych wizytach.
- KA: Przycisk „Zmień lokalizację" w headerze aktualny przez cały czas.
- MUST · 3 SP

**[US-04a]** Jako kierowca chcę zobaczyć listę mobilnych punktów w moim mieście aby wybrać najlepszy.
- KA: API `GET /providers?city=&lat=&lng=` → dane renderowane jako karty.
- KA: Karta pokazuje: logo, nazwa, typ (Mobilny), ocena (gwiazdki + liczba opinii), dystans w km.
- KA: Widoczni tylko providerzy ze statusem APPROVED i których strefa obsługi obejmuje lokalizację klienta.
- KA: Loading state — skeleton cards (min. 3).
- KA: Error state — komunikat + retry.
- KA: Sortowanie domyślne: najbliższe.
- MUST · 5 SP

**[US-04b]** Jako kierowca chcę widzieć cenę i najbliższy wolny termin bez wchodzenia w profil aby szybko porównać punkty.
- KA: Na karcie — cena dopasowana do rozmiaru opon z mojego profilu i najbliższy wolny slot (np. „Dziś 16:30").
- KA: Cena ma **jawny label**: „180 zł / wymiana 4 opon" (żeby nie było wątpliwości per-koło vs komplet).
- KA: Jeśli klient nie dodał pojazdu → pokaż widełki („140–240 zł") + CTA „Dodaj pojazd, żeby zobaczyć dokładną cenę".
- KA: Slot liczony on-request (nie cache) — zmniejsza race conditions.
- MUST · 3 SP

**[US-05]** Jako kierowca chcę zobaczyć punkty na mapie aby ocenić lokalizację.
- KA: Toggle lista/mapa.
- KA: Mapa (Google Maps embed) z pinezkami; kliknięcie pinezki → mini-karta z CTA „Zobacz profil".
- KA: Mapa uwzględnia aktualne filtry (US-06).
- MUST · 5 SP

**[US-06]** Jako kierowca chcę filtrować i sortować punkty aby znaleźć najtańszy/najbliższy/najlepszy.
- KA: Filtry: „Dostępny dziś" / „Dostępny jutro" / „Dostępny w weekend" (chips, multi-select).
- KA: Filtr: ocena ≥ 4.5 (toggle).
- KA: Sortowanie: najbliższe (default) / najtańsze / najwyższa ocena.
- KA: Filtry aplikowane client-side na cache'owanej liście (bez re-requestu).
- KA: „Wyczyść filtry" — jednym kliknięciem.
- MUST · 5 SP

**[US-39]** Jako kierowca chcę wyszukać punkt po nazwie lub ulicy aby szybko trafić do znajomego punktu.
- KA: Search box nad listą („Szukaj nazwy lub ulicy").
- KA: Debounce 300 ms, dopasowanie po `name` + adresie.
- KA: Brak wyników → „Nic nie znaleziono. Spróbuj inne miasto?".
- SHOULD · 3 SP

**[US-40]** Jako kierowca chcę sensownej obsługi sytuacji brzegowych aby app nie wyglądała na zepsutą.
- KA: **Brak pojazdu w profilu** → karta „Dodaj pojazd, żeby zobaczyć cenę dokładną" + CTA; lista nadal renderuje się z widełkami cen.
- KA: **Brak providerów w mieście** (v0: inne miasto niż Nowy Sącz) → widok „Jeszcze nie mamy punktów w [miasto]. Zostaw email — powiadomimy" (waitlist — zapis do tabeli `WaitlistSignup`).
- KA: **Wszyscy providerzy zajęci 7+ dni** → lista normalnie, ale z banerem „Brak wolnych slotów w najbliższym tygodniu — sprawdź dalsze daty w profilu".
- MUST · 2 SP

**[US-07]** Jako kierowca chcę zobaczyć szczegółowy profil punktu aby podjąć decyzję.
- KA: Zdjęcia — swipeable carousel.
- KA: Cennik — 3 widełki felg jawnie + dopłaty (dojazd, wyważanie).
- KA: Godziny pracy, opis, opinie (top 3 + link do pełnej listy).
- KA: **Sticky CTA „Zarezerwuj termin"** widoczny przez cały scroll — główna akcja.
- KA: Przycisk „Udostępnij" (integracja US-42).
- KA: Przycisk ♡ „Dodaj do ulubionych" (integracja US-41).
- MUST · 5 SP

**[US-41]** Jako kierowca chcę dodać punkt do ulubionych aby szybko umawiać kolejne wizyty.
- KA: Przycisk ♡ na karcie providera i w jego profilu.
- KA: Sekcja „Moje ulubione" w menu głównym.
- KA: Działanie offline (localStorage mirror synchronizowany z API).
- SHOULD · 2 SP

**[US-42]** Jako kierowca chcę udostępnić profil punktu aby polecić go znajomemu.
- KA: Publiczny URL `opony.app/p/<slug>` dla każdego APPROVED providera (SSR dla SEO + OpenGraph meta).
- KA: Przycisk „Udostępnij" w profilu → native Web Share API (fallback: kopiuj URL do clipboard).
- KA: Event share → log do PostHog (atrybucja).
- SHOULD · 2 SP

### 15.3. Epic: Rezerwacja

**[US-08a]** Jako kierowca chcę wybrać slot w kalendarzu aby wybrać konkretną godzinę wizyty.
- KA: Widzę 7 dni do przodu; nawigacja dni (‹ ›).
- KA: Sloty pogrupowane: rano / popołudnie / wieczór.
- KA: Zajęte sloty są disabled i oznaczone.
- KA: Dni całkowicie zamknięte (wyjątki, święta) — nieklikalne.
- KA: Zmiana dnia nie traci wyboru pojazdu/providera.
- MUST · 3 SP

**[US-08b]** Jako kierowca chcę podać adres wizyty aby provider wiedział, gdzie przyjechać.
- KA: Pole adresu z autouzupełnianiem (Google Places / Geocoding).
- KA: Default — adres z profilu klienta (jeśli ustawiony).
- KA: Geocoding → lat/lng zapisane z rezerwacją.
- KA: Walidacja strefy: jeśli adres poza `serviceRadiusKm` → inline error z sugestią innych providerów obsługujących ten adres.
- MUST · 3 SP

**[US-08c]** Jako kierowca chcę sfinalizować rezerwację i być zabezpieczony przed wyścigiem z innym klientem.
- KA: Ekran podsumowania: provider, data/godzina, adres, rozmiar opon, cena całkowita.
- KA: Przycisk „Potwierdź" → `POST /bookings` z nagłówkiem `Idempotency-Key`.
- KA: Sukces → przejście na ekran potwierdzenia (US-10).
- KA: Obsługa 409 `SlotAlreadyBooked` → komunikat „Ten slot właśnie zajęto" + lista 3 alternatywnych slotów z tego samego dnia do wyboru jednym kliknięciem.
- KA: Obsługa 422 `AddressOutsideServiceZone` → powrót do US-08b z highlightem pola.
- MUST · 2 SP

**[US-09]** Jako kierowca chcę zostawić notatkę dla usługodawcy aby przekazać kontekst (np. „pies w ogrodzie", „dzwonić przed przyjazdem").
- KA: Opcjonalne pole tekstowe na ekranie finalizacji, max 500 znaków.
- KA: Widoczne dla providera w szczegółach rezerwacji.
- MUST · 1 SP

**[US-10]** Jako kierowca chcę dostać potwierdzenie rezerwacji (w app + SMS) aby mieć pewność.
- KA: Ekran potwierdzenia: kod OPN-XXXX, data/godzina, provider, adres, cena, CTA „Dodaj do kalendarza".
- KA: SMS w < 60 s z kodem, datą, nazwą providera, adresem, ceną.
- KA: Dodaj do kalendarza — generuje `.ics` / deep-link.
- MUST · 3 SP

**[US-11]** Jako kierowca chcę dostawać przypomnienia 24h i 1h przed wizytą aby nie zapomnieć.
- KA: Cron scheduluje SMS-y po utworzeniu CONFIRMED.
- KA: Jeśli rezerwacja anulowana/przełożona — scheduled SMS-y unieważnione.
- KA: Treść 24h: kod, jutro o HH:MM, adres providera/dojazdu.
- KA: Treść 1h: „Za godzinę: [provider] u Ciebie o HH:MM. Kontakt: +48…".
- MUST · 2 SP

**[US-12]** Jako kierowca chcę widzieć listę swoich rezerwacji aby kontrolować co mam zaplanowane.
- KA: Zakładki „Nadchodzące" (PENDING + CONFIRMED + IN_PROGRESS) / „Historia" (COMPLETED + CANCELLED_* + NO_SHOW + REJECTED).
- KA: Karta: data, godzina, provider, status (badge kolorem), cena.
- KA: Paginacja (20/stronę).
- KA: Pusta lista → ilustracja + CTA „Znajdź punkt".
- MUST · 3 SP

**[US-13]** Jako kierowca chcę zobaczyć szczegóły rezerwacji aby sprawdzić dane i wykonać akcje.
- KA: Wszystkie pola: kod, provider (z linkiem do profilu), data/godzina, adres, pojazd, notatka, cena (rozbite), status + historia statusów.
- KA: Akcje kontekstowe wg statusu:
  - PENDING/CONFIRMED + > 2h przed: [Zmień termin], [Anuluj]
  - PENDING/CONFIRMED + < 2h: [Anuluj z ostrzeżeniem]
  - COMPLETED bez oceny: [Oceń wizytę] (jump do US-16)
  - COMPLETED z oceną: [Zobacz moją ocenę]
- KA: Przycisk [Dodaj do kalendarza] zawsze.
- MUST · 2 SP

**[US-14]** Jako kierowca chcę anulować rezerwację aby nie dzwonić, jeśli plany się zmienią.
- KA: Anulowanie > 2h przed — bez konsekwencji; powód opcjonalny.
- KA: Anulowanie < 2h przed — dialog z ostrzeżeniem „To podbije Twój licznik no-show"; po potwierdzeniu `noShowCount++`.
- KA: SMS informacyjny do providera.
- KA: Status → `CANCELLED_BY_CLIENT` (terminalny).
- SHOULD · 3 SP

**[US-15]** Jako kierowca chcę przełożyć termin rezerwacji aby nie musieć anulować i rezerwować od nowa.
- KA: Dostępne tylko dla PENDING/CONFIRMED > 2h przed `startAt`.
- KA: Flow: ekran wyboru nowego slotu (reuse US-08a) u tego samego providera.
- KA: Operacja atomowa: stary slot zwolniony, nowy zajęty (transakcja DB).
- KA: 409 jeśli nowy slot zajęty → wyświetl alternatywy.
- KA: SMS do klienta i providera o nowym terminie; przypomnienia z US-11 przepianowane.
- SHOULD · 5 SP

### 15.4. Epic: Oceny

**[US-16]** Jako kierowca chcę ocenić wizytę (1–5 gwiazdek + komentarz) aby pomóc innym.
- KA: Ocena dostępna **wyłącznie** dla rezerwacji w statusie COMPLETED (DB check + API guard).
- KA: Okno na wystawienie opinii: **90 dni** od `completedAt`. Po tym czasie — tylko podgląd.
- KA: Prompt w aplikacji przy pierwszym otwarciu po COMPLETED + SMS z linkiem deeplink.
- KA: Komentarz — tekst do 1000 znaków.
- KA: Filtr wulgaryzmów — lista blokowanych słów (PL), walidacja client-side przy wpisywaniu + server-side; match → błąd „Komentarz zawiera niedozwolone słowa".
- KA: Ocena domyślnie auto-visible; admin może ukryć (US-48 + Retool).
- KA: 1 ocena per `Booking` (constraint DB).
- MUST · 5 SP

**[US-17]** Jako kierowca chcę widzieć opinie innych aby ocenić wiarygodność punktu.
- KA: Lista opinii z paginacją (20/stronę).
- KA: **Rozkład ocen** na górze: pasek pokazujący % dla każdej wartości 1–5⭐ (np. 5⭐ 80% / 4⭐ 10% / 3⭐ 5% / 2⭐ 3% / 1⭐ 2%) + średnia ocena + liczba opinii.
- KA: **Sortowanie**: najnowsze (default) / najwyższa ocena / najniższa ocena.
- KA: **Filtrowanie** po gwiazdkach (chip per wartość; multi-select).
- KA: Widoczne odpowiedzi providera (jeśli są) pod każdą opinią.
- KA: Badge „Zweryfikowany klient" przy każdej opinii (zawsze true w v0 — ocena możliwa tylko po COMPLETED).
- MUST · 4 SP

**[US-48]** Jako provider chcę zgłosić obraźliwą lub fałszywą opinię aby admin ją sprawdził.
- KA: Przycisk „Zgłoś" pod każdą opinią w panelu B2B (US-34).
- KA: Formularz: kategoria (obraźliwa / fałszywa / konkurencja / inne) + opcjonalny komentarz.
- KA: Flaga `isReported = true` + ilość zgłoszeń; admin widzi w kolejce moderacji (`/admin/reviews?reported=true`).
- KA: Admin decyduje: pozostaw / ukryj (`isHidden = true`) / skontaktuj się z providerem.
- KA: Provider dostaje email po decyzji admina („ukryto" / „pozostawiono — poniżej argumenty admina").
- KA: SLA admina: decyzja w 48h.
- MUST · 2 SP

**[US-49]** Jako kierowca chcę edytować lub usunąć swoją opinię aby skorygować pochopną ocenę.
- KA: Edycja dozwolona w ciągu **48h** od utworzenia; potem przycisk disabled („Edycja wygasła").
- KA: Usunięcie dozwolone bez limitu czasowego.
- KA: Każda edycja zwiększa `Review.editCount` i ustawia `Review.lastEditedAt` (ślad).
- KA: Po usunięciu → soft delete + przeliczenie `Provider.avgRating` (trigger US-37).
- KA: Publicznie widoczne tylko ostatnia wersja (bez historii zmian).
- SHOULD · 2 SP

### 15.5. Epic: Onboarding usługodawcy

**[US-43]** Jako właściciel firmy muszę zaakceptować regulamin i zgody RODO aby móc legalnie korzystać z platformy.
- KA: Pierwszy krok wizardu rejestracji — checkboxy:
  - Regulamin platformy (z prowizją 8% / 0% w okresie pilotażowym).
  - Polityka prywatności + zgoda RODO (administrator: Opony sp. z o.o. / JDG założyciela).
  - Zgoda na marketing (opcjonalna).
- KA: Bez 2 obowiązkowych zgód — `NEXT` disabled.
- KA: Zapis timestampu + IP + wersji regulaminu w tabeli `ConsentLog` (ślad audytowy prawny).
- KA: Zmiana regulaminu w przyszłości → re-akceptacja przy kolejnym logowaniu.
- MUST · 2 SP

**[US-18]** Jako właściciel mobilnego punktu chcę zarejestrować firmę przez NIP aby automatycznie uzupełnić dane.
- KA: Podaję NIP → call do GUS BIR API → auto-wypełnione: nazwa prawna, adres, forma prawna, PKD.
- KA: Fallback: jeśli GUS nie zwraca pełnych danych (typowe dla JDG) → secondary call do CEIDG API dla jednoosobowych działalności.
- KA: Podaję telefon + email (email do komunikacji/notyfikacji, nie do auth).
- KA: Brak hasła — logowanie SMS OTP (ten sam flow co klient).
- KA: Flow zaprojektowany jako **wizard z progress barem** („Krok 1/3: Firma").
- MUST · 6 SP

**[US-19]** Jako usługodawca chcę wgrać zdjęcia i certyfikaty aby zweryfikować tożsamość.
- KA: Upload min. 3 zdjęć: logo/awatar firmy, van / pojazd serwisowy, stanowisko pracy (wnętrze vana z narzędziami).
- KA: Wymagane pliki: JPG/PNG, max 5 MB/plik.
- KA: Wizard „Krok 2/3: Materiały" z progress barem; po uploadzie status providera → `PENDING_APPROVAL`.
- KA: Wizard „Krok 3/3: Weryfikacja" to ekran oczekiwania z info „czas weryfikacji do 24h, damy znać mailem/SMS".
- MUST · 3 SP

**[US-44]** Jako provider po odrzuceniu chcę dostać jasny powód i wiedzieć jak to naprawić aby móc dokończyć rejestrację.
- KA: Admin przy reject wybiera kategorię powodu (lista: „niewyraźne zdjęcia", „niezgodność NIP", „brak pojazdu na zdjęciach", „inne") + opcjonalny komentarz.
- KA: Provider dostaje SMS + email: „Twoje zgłoszenie wymaga poprawy: [kategoria]. Napisz do nas: kontakt@opony.app — pomożemy." (v0 bez self-service reopen).
- KA: Mailto link w SMS + email.
- KA: Na etapie v0 reopen zgłoszenia robi admin ręcznie (Retool: zmiana statusu REJECTED → PENDING_DOCS).
- MUST · 1 SP

**[US-20]** Jako admin platformy chcę weryfikować nowych providerów aby filtrować oszustów.
- KA: Panel Retool: lista `PENDING_APPROVAL` → jednym klikiem approve/reject z kategorią powodu.
- KA: Przy approve — SMS + email do providera „konto aktywne" + link do dashboardu.
- KA: Przy reject — trigger US-44 (SMS + email z powodem).
- KA: **Cron raz dziennie** o 9:00: email do admina z podsumowaniem „X zgłoszeń PENDING_APPROVAL (najstarsze Y dni)". Jeśli > 5 zaległych → dodatkowo SMS do admina.
- MUST · 6 SP

### 15.6. Epic: Panel B2B

**[US-21]** Jako właściciel firmy chcę zalogować się do panelu aby zarządzać swoją działalnością.
- KA: Login SMS OTP (ten sam flow co klient — phone + code). Telefon podany przy rejestracji (US-18).
- KA: Sesja 30 dni (refresh token JWT); akcja „Wyloguj wszędzie".
- KA: Provider ze statusem ≠ APPROVED po zalogowaniu widzi ekran informacyjny ze statusem (np. „Czekamy na weryfikację"), bez dostępu do panelu.
- KA: Rate limit: max 3 kody OTP / 15 min / numer telefonu (wspólny z klientem).
- MUST · 2 SP

**[US-22]** Jako nowo-zatwierdzony usługodawca chcę dostać przewodnik pierwszych kroków aby szybko uruchomić profil.
- KA: Pierwsze logowanie po APPROVED → checklist 3-kroków na dashboardzie: „Ustaw cennik", „Ustaw godziny pracy", „Ustaw strefę obsługi".
- KA: Każdy krok linkuje do właściwego ekranu (US-24 / US-25).
- KA: Profil providera jest **ukryty dla klientów** (nie pojawia się w wyszukiwarce) do momentu ukończenia wszystkich 3 kroków — zabezpieczenie jakości MVP.
- KA: Checklist znika po pełnym ukończeniu; status „Ukryty" zmienia się na „Aktywny".
- SHOULD · 3 SP

**[US-23]** Jako usługodawca chcę edytować profil firmy (opis, logo, zdjęcia) aby aktualizować wizerunek.
- KA: Edycja opisu (max 2000 znaków), logo, galerii (do 10 zdjęć).
- KA: Nazwa firmy zmienia się tylko poprzez wsparcie (zmiana rejestrowa — GUS).
- KA: Publiczny profil odświeża się w < 5 min (cache).
- MUST · 3 SP

**[US-24]** Jako usługodawca chcę ustawić cennik aby klienci znali ceny z góry.
- KA: Edycja 3 widełek felg + dopłat za dojazd/wyważanie.
- KA: Zmiana cennika **nie wpływa** na już utworzone rezerwacje (snapshot).
- MUST · 3 SP

**[US-25]** Jako usługodawca chcę ustawić godziny pracy i strefę obsługi aby system generował właściwe sloty.
- KA: Godziny na każdy dzień tygodnia + długość slotu (domyślnie 45 min).
- KA: Wyjątki (urlopy, święta).
- KA: Strefa: centrum (pin na mapie) + promień w km.
- MUST · 5 SP

**[US-26]** Jako usługodawca chcę widzieć dzienną listę rezerwacji aby zaplanować pracę.
- KA: Widok dnia — lista chronologiczna z adresami, cenami, statusami.
- KA: Stany: PENDING (wymaga akcji), CONFIRMED, IN_PROGRESS, COMPLETED.
- KA: Akcje inline: Akceptuj / Odrzuć / Rozpocznij / Zakończ / Anuluj.
- KA: Kliknięcie w kartę → szczegół rezerwacji (US-28).
- KA: W menu bocznym — badge z licznikiem: „Opinie (N nowych)" dla opinii nieprzeczytanych przez providera (flaga `Review.seenByProvider = false`).
- MUST · 8 SP

**[US-27]** Jako usługodawca chcę zobaczyć kalendarz tygodniowy i miesięczny aby planować z wyprzedzeniem.
- KA: Przełącznik widoku: Dzień / Tydzień / Miesiąc.
- KA: Tydzień — grid godzina × dzień; każda rezerwacja jako kolorowy blok (kolor wg statusu).
- KA: Miesiąc — siatka kalendarza z liczbą rezerwacji / dzień; kliknięcie dnia → widok dnia.
- KA: Eksport do iCal / Google Calendar jako read-only feed (link subskrypcyjny).
- SHOULD · 5 SP

**[US-28]** Jako usługodawca chcę zobaczyć pełne szczegóły rezerwacji aby przygotować się do wizyty.
- KA: Wszystkie dane: kod OPN-XXXX, klient (imię + telefon jako tel-link), pojazd, rozmiar opon, adres (z miniaturą mapy), notatka klienta, rozbita cena.
- KA: Timeline historii statusów (kto, kiedy).
- KA: Akcje kontekstowe wg statusu: Akceptuj / Odrzuć / Rozpocznij / Zakończ / Zmień termin (US-31) / Anuluj / Oznacz NO_SHOW (US-32).
- MUST · 2 SP

**[US-29]** Jako usługodawca chcę dostać powiadomienie o nowej rezerwacji z eskalacją, aby jej nie przeoczyć.
- KA: SMS + email natychmiast po utworzeniu PENDING.
- KA: Eskalacja: jeśli brak reakcji > 2h → ponowny SMS. Po kolejnych 4h (łącznie 6h) → 3. SMS oznaczony „PILNE, klient czeka".
- KA: **Brak auto-reject w v0** — każda PENDING wymaga ręcznej akcji providera (akceptacja lub odrzucenie).
- KA: Provider z > 24h nieobsłużoną PENDING widzi na dashboardzie ostrzeżenie („Masz 2 nieobsłużone rezerwacje").
- KA: Wielokrotne przekroczenia 24h → flaga dla admina (monitoring jakości).
- MUST · 3 SP

**[US-30]** Jako usługodawca chcę ręcznie dodać rezerwację (klient zadzwonił) aby zarezerwować slot.
- KA: W widoku dnia przycisk „+ Dodaj wizytę ręcznie".
- KA: Formularz: telefon klienta (wyszukanie istniejącego User'a lub stworzenie nowego z placeholder-em), rozmiar opon, wybór wolnego slotu, adres, opcjonalna notatka.
- KA: Status od razu `CONFIRMED` (provider ręcznie potwierdził).
- KA: Slot zajęty tak samo jak online booking — ten sam unique constraint DB.
- KA: Jeśli klient ma konto, rezerwacja pojawia się w jego historii + dostaje SMS potwierdzający. Jeśli nie ma — SMS z linkiem do założenia konta.
- MUST · 3 SP

**[US-31]** Jako usługodawca chcę przełożyć termin rezerwacji aby obsłużyć nagłe awarie.
- KA: Dostępne dla PENDING/CONFIRMED, > 2h przed `startAt`.
- KA: Formularz: wybór nowego slotu u siebie + wymagany powód (lista: awaria pojazdu, choroba, inne).
- KA: Operacja atomowa — stary slot zwolniony, nowy zajęty.
- KA: SMS do klienta: „Zmieniono termin — nowa godzina HH:MM, powód: [...]. Akceptujesz? [Tak] [Anuluj rezerwację]".
- KA: Częste zmiany przez providera (> 3 / miesiąc) → flag w admin dashboard.
- SHOULD · 3 SP

**[US-32]** Jako usługodawca chcę oznaczyć klienta jako NO_SHOW wcześniej niż auto-cron aby móc jechać do następnego.
- KA: W szczegółach CONFIRMED, gdy `NOW() > startAt`, dostępny przycisk „Klient się nie pojawił".
- KA: Opcjonalna notatka i zdjęcie (evidence — np. foto drzwi/bramy).
- KA: Status → `NO_SHOW`, `clientNoShowCount++`.
- KA: Klient dostaje SMS: „Zostałeś oznaczony jako no-show. Masz wątpliwości? [link do apelacji]" (v0: mailto do kontakt@opony.app).
- SHOULD · 2 SP

**[US-33]** Jako usługodawca chcę nawigować do klienta jednym kliknięciem aby nie tracić czasu.
- KA: Przycisk „Nawiguj" → otwiera Google Maps / Apple Maps z adresem klienta (deep-link).
- SHOULD · 2 SP

**[US-34]** Jako usługodawca chcę odpowiedzieć na opinię aby komunikować się z klientami.
- KA: Jedna odpowiedź na opinię, edytowalna w 24h, potem zablokowana.
- KA: Obok każdej opinii — przycisk „Zgłoś" (integracja z US-48).
- SHOULD · 3 SP

**[US-35]** Jako usługodawca chcę widzieć statystyki swojej działalności aby rozumieć trendy.
- KA: Dashboard z metrykami: rezerwacji (ten tydzień / ten miesiąc), obrót (PLN), średnia ocena, pozycja w mieście (ranking).
- KA: Wykres rezerwacji dniowy (ostatnie 30 dni).
- KA: Top 3 opinie z ostatnich 7 dni (pełne).
- KA: Link „Pobierz CSV" — v0: email z linkiem wysyłany przez admina na żądanie; v1: direct download.
- SHOULD · 3 SP

### 15.7a. Epic: Płatności online

**[US-50]** Jako klient chcę zapłacić online (BLIK/kartą) przy rezerwacji aby mieć gwarancję terminu.
- KA: Płatność pełnej kwoty w momencie rezerwacji (ekran finalizacji US-08c → redirect do Przelewy24).
- KA: Metody: BLIK (primary), karta (Visa/MC), przelew ekspresowy.
- KA: Przelewy24 hosted payment page (redirect → success → powrót do app → US-10 ekran potwierdzenia).
- KA: Timeout płatności: 15 min (BLIK: 120 s). Po timeout → booking auto-cancelled, slot zwolniony.
- KA: W przypadku błędu → komunikat + retry.
- KA: Pieniądze trafiają na subkonto platformy (escrow / P24 marketplace split).
- MUST · 5 SP

**[US-51]** Jako platforma chcę automatycznie rozliczać prowizję i wypłacać providerowi po realizacji.
- KA: Po `Booking.status = COMPLETED` → settlement: kwota − 8% prowizji → do wypłaty providerowi.
- KA: Cykl wypłat: **tygodniowy** (każdy poniedziałek za poprzedni tydzień) — batch payout na konto bankowe providera.
- KA: Provider widzi w panelu B2B sekcję „Finanse": saldo pending, historia wypłat.
- KA: Platforma generuje miesięczne podsumowanie prowizji (faktura wewnętrzna) per provider.
- MUST · 3 SP

**[US-52]** Jako klient chcę automatyczny refund przy anulowaniu aby nie tracić pieniędzy.
- KA: Anulowanie przez klienta > 2h przed → **pełny refund** automatycznie (P24 refund API).
- KA: Anulowanie przez klienta < 2h → **brak refundu**; provider otrzymuje kwotę − prowizja.
- KA: Anulowanie przez providera (dowolny czas) → **pełny refund** klientowi automatycznie.
- KA: NO_SHOW → **brak refundu**; provider otrzymuje kwotę − prowizja.
- KA: Refund w ciągu 1–3 dni roboczych (zależne od banku klienta).
- KA: Status refundu widoczny w szczegółach rezerwacji.
- MUST · 3 SP

**[US-53]** Jako provider chcę widzieć saldo i historię wypłat aby kontrolować finanse.
- KA: W panelu B2B sekcja „Finanse": saldo (pending), data następnej wypłaty, historia.
- KA: Każda wypłata: data, kwota, lista rezerwacji z rozbiciem (cena klienta, prowizja, netto).
- KA: Export PDF (v0: email z podsumowaniem; v1: direct download).
- SHOULD · 3 SP

### 15.7b. Epic: Systemowe

**[US-36]** Jako system chcę automatycznie oznaczać NO_SHOW aby dane były spójne.
- KA: Cron co 5 min: `CONFIRMED` + `startAt < NOW()-30min` → `NO_SHOW` + `clientNoShowCount++`.
- KA: Jeśli provider już oznaczył NO_SHOW (US-32) — cron pomija.
- MUST · 2 SP

**[US-37]** Jako system chcę aktualizować avgRating providera aby lista była aktualna.
- KA: Cron 1h: przeliczenie `avgRating` i `reviewCount`.
- MUST · 2 SP

**[US-54]** Jako system chcę anulować nieopłacone rezerwacje po 15 min aby nie blokować slotów.
- KA: Cron co 1 min: `Payment.status = INITIATED` + `createdAt < NOW()-15min` → Payment = FAILED, Booking = CANCELLED_BY_CLIENT, slot zwolniony.
- MUST · 1 SP

**[US-55]** Jako system chcę realizować tygodniowe wypłaty providerom aby automatyzować rozliczenia.
- KA: Cron w poniedziałek 6:00: zbierz wszystkie `Payment.payoutStatus = PENDING` + `Booking.status = COMPLETED` → batch payout via P24 API / przelew bankowy.
- KA: Ustaw `Payment.payoutStatus = PAID`, `paidOutAt = NOW()`.
- KA: Email do providera z podsumowaniem wypłaty.
- MUST · 2 SP

### 15.8. Podsumowanie zakresu MVP v0

| Epic | Stories | MUST | SP (MUST) |
|---|---:|---:|---:|
| Autentykacja | 6 | 5 | 15 |
| Wyszukiwanie | 10 | 7 | 28 |
| Rezerwacja | 10 | 8 | 19 |
| Oceny | 4 | 3 | 11 |
| Onboarding | 5 | 5 | 18 |
| Panel B2B | 15 | 8 | 29 |
| Płatności online | 4 | 3 | 11 |
| Systemowe | 4 | 4 | 7 |
| **RAZEM** | **58** | **43** | **138 SP (MUST)** |

Przy zespole 4 os. i velocity ~20 SP/tydzień → **~7 tygodni** na MUST. Mieści się w oknie 6–8 tyg. Opcje dalszej optymalizacji:
- powiększyć zespół do 4 os. (7 → 8,1 tyg. schodzi do ~6 tyg.),
- wydłużyć okno MVP v0 do 9 tygodni,
- zdegradować część MUST do SHOULD (kandydaci: US-35 statystyki providera, US-27 kalendarz tygodniowy — ale są już SHOULD; realniej — odłożyć US-46 eksport RODO, zostawić tylko „usuń konto").

SHOULD: **~36 SP** (dodatkowe ~2,5 tygodnia, jeśli sprawdzi się velocity).

### 15.9. Jawnie poza zakresem MVP v0 (out of scope)

Spisane, żeby uciąć dyskusję „a może jeszcze to" na etapie developmentu:

| Funkcja | Dlaczego nie w v0 | Kiedy |
|---|---|---|
| Rezerwacja „dla kogoś innego" (pojazd znajomego) | Komplikuje model danych (czyj to pojazd?) i UX | v1+ |
| Rezerwacja gościnna (bez konta) | Zwiększa no-show, trudniej prowadzić SMS-y potwierdzające | v1+ |
| ~~Płatność online~~ | ~~Przeniesione do MUST v0 — patrz epic 15.7a Płatności~~ | **v0** ✅ |
| Grupowanie usług (wymiana + wyważanie w jednym slocie) | Wymaga macierzy cennika i logiki czasu trwania per usługa | v1 |
| Zmiana adresu po potwierdzeniu | Provider już rozplanował trasę; w v0 klient anuluje + rezerwuje | v1+ |
| Przełożenie na innego providera | Każdy provider ma własny kalendarz; w v0 anuluj + nowa rezerwacja | v2+ |
| Stała kolejka (klient zapisany, provider wybiera slot) | Odwrotny flow, komplikuje UX klienta | rozważyć v2 |
| Powiadomienia push (zamiast SMS) | Tylko z natywną apką RN | v1 |
| Warsztaty stacjonarne | Inny model slotów (stanowiska, nie kalendarz vana) | v1 |
| Zarządzanie pracownikami (role PROVIDER_STAFF) | Solo-operatorzy dominują w v0; RBAC w panelu = zbędna komplikacja | v1 |
| Auto-reject PENDING po 12h | Karze zajętych providerów; w v0 tylko eskalacja SMS (US-29) | v1 — jako opcja konfigurowalna |
| Rejestracja providerów z miast poza zasięgiem v0 (np. Tarnów) | W v0 obsługujemy tylko Nowy Sącz — blok rejestracji + mailto waitlist | v1 (przy ekspansji) |
| Multi-provider (jedno konto właściciela = wiele firm) | Edge case; w v0 jeden `User PROVIDER_OWNER` = jeden `Provider` | v2+ |
| Self-service reopen po REJECTED | Admin robi reopen ręcznie (Retool); automatyzacja w v1 | v1 |
| Social login (Google / Apple) | Decyzja z sekcji 11.1: tylko SMS OTP w v0 | v1 |
| Magic link email jako alternatywa OTP | SMS OTP wystarczy; magic link to dodatkowa komplikacja bez realnego zysku | v1 |
| Biometric / passkey | Wymaga natywnej apki (nie PWA) | v2+ |
| Review badges / gamifikacja („Top Reviewer") | Komplikuje UI, w v0 nie buduje wartości | v2+ |
| Dwukierunkowe opinie (provider o kliencie) | Zmienia zaufanie i wymaga osobnego UX | v2+ |
| Zdjęcia w opiniach | Moderacja zdjęć drogie (może wrzucić obraźliwe); tekstowe opinie wystarczą | v1 |


---

## 19. Plan migracji MVP v0 → MVP v1

Plan ewolucji po walidacji MVP v0 w Nowym Sączu (kryteria w sekcji 11.5).

### 19.1. Co ewoluuje — tabela zmian

| Obszar | MVP v0 (Nowy Sącz) | MVP v1 | Ryzyko migracji |
|---|---|---|---|
| Klient | PWA (Next.js) | + RN/Expo apki iOS/Android | Niskie — to osobna apka, PWA nadal działa |
| B2B | Web (Next.js) | + RN/Expo apka mobile | Niskie — web nadal główny, apka to dodatek |
| Typ providerów | Tylko MOBILE | + STATIONARY | Średnie — nowe przepływy UX |
| Zasięg | 1 miasto (Nowy Sącz) | 3–4 miasta (Tarnów, Rzeszów, Kraków) | Średnie — replikacja GTM playbooka |
| Strefa obsługi | Promień km | Polygon (PostGIS) | Średnie — migracja danych |
| Cennik | 3 widełki felg | Macierz rozmiar × usługa | Średnie — schema migration |
| Powiadomienia | SMS | + Push (Expo Push) | Niskie |
| Płatności | Przelewy24 (BLIK + karta) | + Stripe (Apple Pay, karty zagraniczne) | Niskie — rozszerzenie, nie migracja |
| Dostępność slotów | Polling | WebSocket / SSE | Niskie |
| Optymalizacja tras | — | Mapbox Optimization | Nowa funkcja |
| SMS provider | Twilio | SMSAPI.pl | Niskie — abstrakcja interfejsu (18.2) |
| Admin | Retool | Własny panel (Next.js) | Niskie — stopniowa migracja |

### 19.2. Kolejność (fazowanie v1)

**Faza 1 — „mobile-ready" (2 mc po walidacji v0):**
- **SMSAPI.pl** — migracja z Twilio (1 dzień, −60% koszt SMS).
- **RN apki klienta** (priorytet: lepsze UX map + push → mniej no-show).
- **Push notifications** (zastąpienie części SMS → dalsze oszczędności).
- **Płatności online BLIK** (depozyt 20 zł antyno-show) — Przelewy24 primary, Stripe fallback.

**Faza 2 — „expand types" (1 mc):**
- **Warsztaty stacjonarne** — dodanie `type=STATIONARY`, inna logika slotów (stałe stanowiska), profil nie ma adresu dojazdu.
- **Macierz cennika** — migracja 3 widełek → macierz rozmiar × typ usługi.

**Faza 3 — „GIS + routes" (1 mc):**
- **PostGIS** — migracja strefy promień → polygon; widoczność providerów mapowana po `ST_Contains`.
- **Optymalizacja tras** (Mapbox Optimization API dla B2B mobile).

**Faza 4 — „expand cities" (ongoing):**
- **Ekspansja: Tarnów** (najbliższe miasto, ~110k, naturalne zaplecze Nowego Sącza).
- **Ekspansja: Rzeszów** (~190k, stolica Podkarpacia — duży skok).
- **Ekspansja: Kraków** (~800k, aspiracyjne — wymaga dedykowanego GTM).
- Własny admin (stopniowa migracja z Retool, ekran po ekranie).

### 19.3. Strategia migracji danych (PostGIS)

1. Dodaj kolumnę `Provider.serviceZone GEOMETRY(POLYGON, 4326)` obok istniejącej `serviceRadiusKm`.
2. Seed: `serviceZone = ST_Buffer(ST_Point(cityCenterLng, cityCenterLat)::geography, serviceRadiusKm * 1000)::geometry`.
3. Przez 2 tygodnie dual-write: oba pola aktualizowane przy edycji strefy.
4. Migracja logiki weryfikacji adresu: z haversine na `ST_Contains(serviceZone, clientPoint)`.
5. Pozostawienie `serviceRadiusKm` jako read-only do deprecation, potem drop.
6. W UI providera — edytor polygon (Mapbox Draw / Google Drawing Library).

### 19.4. Strategia wypuszczenia RN apki bez disruption

1. PWA nadal działa (fallback dla userów bez natywnej apki).
2. RN apka pod tą samą domeną API — zero breaking changes.
3. Rollout: TestFlight/Internal Testing → 50 early adopters (Nowy Sącz) → 500 → public.
4. Feature flag `FEATURE_NATIVE_APP` — banner w PWA „Pobierz apkę" włączany per miasto.
5. Deep links: `opony.app/p/<slug>` otwiera PWA lub apkę natywną (Universal Links / App Links).

### 19.5. Strategia migracji cennika (widełki → macierz)

1. Schema: nowa tabela `PricingMatrix(providerId, tireSize, serviceType, pricePln)`.
2. Seed: każdy istniejący `PricingTier` → wiele wierszy matrix (widełki 16–17" → 205/55R16, 225/45R17 itd. z tą samą ceną).
3. UI: przełącznik „Prosty cennik" (legacy) vs „Szczegółowy cennik" — provider wybiera.
4. Po 3 mc — legacy usuwany (providerzy migrują na szczegółowy).

### 19.6. Pitfalls do unikania

1. **Nie migruj wszystkiego na raz** — każda faza to osobny release z rollbackiem.
2. **Nie usuwaj danych MVP v0** — provider z opiniami w v0 musi je mieć w v1.
3. **Utrzymuj zgodność API** — dodawaj pola, nie usuwaj; breaking changes przez `/v2` endpoint.
4. **Testuj płatności na prod-like sandbox** — BLIK ma pitfalls (timeout 120 s, reject codes, partial refund).
5. **Komunikuj zmiany providerom z wyprzedzeniem** — 14 dni przed breaking UX change, brief + call.
6. **Nie uruchamiaj nowego miasta bez supply** — minimum 8 providerów APPROVED + seed demand przed kampanią klientom (lekcja z 17.10).
7. **Per-city feature flags** — nowe miasto może mieć inne konfiguracje (cennik, strefy, godziny). Nie hardcoduj per miasto.

### 19.7. Playbook replikacji miasta (Nowy Sącz → kolejne)

Cel: **powtarzalny proces uruchomienia nowego miasta w 4 tygodnie.**

| Tydzień | Działanie |
|---:|---|
| −4 | Research: Excel providerów w mieście (Google Maps, OLX, Panorama Firm). Segmentacja A/B/C. |
| −3 | Outreach: 15 telefonów/tydz, wizyty u top 5 (segment A). |
| −2 | Sign-up: 8 providerów pilotażowych. Onboarding shoulder-to-shoulder. |
| −1 | Soft-launch: profilerzy aktywni, seed demand (friends & family + founder-as-customer). |
| **0** | **Public launch:** kampania marketingowa (Google Ads + FB + grupy lokalne). |
| 1–4 | Doładowanie: kolejni providerzy (tier 2–3), referral program, partnerstwa lokalne. |
| **4** | **Checkpoint:** ≥ 12 providerów, ≥ 80 rez/mc, TTFB < 7 dni → miasto „live". |

**Koszty per nowe miasto:**
- Marketing launch (4 tyg. × 1 500 PLN): ~6 000 PLN.
- Incentywy (8 pilotażowych × 0% prowizji × 2 mc): ~3 000 PLN utracony przychód.
- Seed demand (kody + founder-as-customer): ~3 000 PLN.
- Outreach (paliwo, ulotki): ~1 000 PLN.
- **Razem: ~13 000 PLN per miasto** (malejąco — playbook się doskonali).

**Ścieżka ekspansji z Nowego Sącza:**

```
Nowy Sącz (v0, pilot)
     ↓ walidacja OK
Tarnów (~110k, 80 km, naturalny następny)
     ↓
Rzeszów (~190k, 160 km, stolica Podkarpacia)
     ↓
Kraków (~800k, aspiracyjny — wymaga dedykowanego city managera)
     ↓
Katowice / Wrocław / Poznań (faza skalowania, rok 2–3)
```

### 19.8. Definition of Done dla v1

- **3 miasta live** (Nowy Sącz + Tarnów + Rzeszów).
- Warsztaty stacjonarne + mobilne działają równocześnie.
- \> 60 aktywnych providerów (łącznie 3 miasta).
- \> 2 000 rezerwacji/mc w szczycie (łącznie).
- RN apki na App Store + Google Play (rating > 4.3).
- Płatności online > 40% rezerwacji.
- SMSAPI.pl jako primary SMS provider.
- Powtarzalny playbook replikacji (19.7) przetestowany na 2 miastach.
- MRR z abonamentów providerów > 5k PLN.

---

## 20. Plan sprintów dla agentów AI

Zespół 4 agentów AI pracujących równolegle. Velocity ~20 SP/tydzień. 139 SP MUST w 7 sprintach.

### 20.0. Konwencje techniczne (obowiązują WSZYSTKIE agenty)

**Stack i narzędzia:**
- Backend: NestJS, Prisma ORM, PostgreSQL, class-validator + Zod dla walidacji DTO
- Frontend: Next.js 14+ (App Router), React Context (stan auth), React Hook Form + Zod (formularze), MSW (mocki API)
- Wspólne: TypeScript strict, ESLint, Prettier, pnpm workspaces, Turborepo
- Testy BE: Jest + supertest. Testy FE: Vitest + Testing Library. E2E: Playwright.

**Konwencje API (BE agenty):**
- Wszystkie endpointy pod prefixem `/v1` (np. `POST /v1/auth/otp/request`)
- Błędy: RFC 7807 Problem Details (`{type, title, status, detail, instance}`)
- NestJS Swagger: każdy controller generuje OpenAPI spec automatycznie
- Walidacja: `class-validator` na DTO + Zod schema dla complex rules
- Idempotencja: nagłówek `Idempotency-Key` na POST-ach mutujących

**Konwencje Frontend (FE agenty):**
- Formularze: React Hook Form + Zod schema (walidacja client-side identyczna z BE)
- Błędy API: interceptor Axios/fetch → `react-hot-toast` na 4xx/5xx, redirect na 401
- State auth: React Context (`AuthProvider`) z JWT w httpOnly cookie (set przez API)
- API client: generowany z OpenAPI spec (`openapi-typescript` → typed fetch)
- Mock API: MSW (Mock Service Worker) — **FE agenty startują od dnia 1 z mockami**, integracja z realnym API w dniach 3–5 sprintu
- Komponenty: import z `@opony/design-system` (tworzony w Sprint 0)

**Konwencje promptów:**
- Każdy agent dostaje **self-contained prompt** z kontekstem, referencjami i DoD
- **Referencje**: `W:12.x` = wireframe, `S:13.1/Table` = schema, `A:14.x` = API, `US-xx` = user story z sekcji 15
- **Output**: ścieżki plików w monorepo (`/apps/api`, `/apps/client`, `/apps/provider`)
- **Schema owner**: w każdym sprincie JEDEN agent BE pisze migracje Prisma — pozostali BE budują na gotowym schemacie

**Git workflow:**
- Każdy agent pracuje na branchu `sprint-X/agent-name` (np. `sprint-1/be-1a-schema`)
- Po zakończeniu → PR do `main` z opisem: co zbudowano, które US pokryte, DoD status
- Merge po przejściu checklisty integracyjnej sprintu
- Konflikty: schema owner merge'uje pierwszy, pozostali rebase'ują

**Env vars:**
- Sprint 0 tworzy `.env.example` z ALL wymaganymi zmiennymi (placeholder values)
- Każdy BE agent dodaje nowe vars do `.env.example` + dokumentuje w PR
- Wymagane vars: `DATABASE_URL`, `JWT_SECRET`, `TWILIO_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE`, `P24_MERCHANT_ID`, `P24_API_KEY`, `P24_CRC`, `RESEND_API_KEY`, `AWS_S3_BUCKET`, `AWS_ACCESS_KEY`, `SENTRY_DSN`, `GOOGLE_MAPS_API_KEY`

**MSW handlers (FE agenty):**
- Sprint 0 dostarcza TYLKO infrastrukturę MSW (config, worker init, folder structure)
- Konkretne handlery pisze KAŻDY FE agent sam na podstawie kontraktu API (A:14.x) — nie polegaj na OpenAPI spec (zbyt wczesny, niekompletny)
- Format: `/apps/client/mocks/handlers/booking.ts`, `/apps/provider/mocks/handlers/provider.ts`
- Swap na real API: zmień `NEXT_PUBLIC_API_MOCK=true` → `false` w `.env.local`

**Rollback:**
- Jeśli agent nie osiąga DoD → branch NIE jest merge'owany do main
- Retry: uruchom agenta ponownie z rozszerzonym promptem (dodaj info o błędach z pierwszego run'a)
- Max 2 retry na agenta. Po 2 failures → human review + manual fix

**Checklista integracyjna (po KAŻDYM sprincie):**
1. `pnpm build` — zero błędów kompilacji we wszystkich apkach
2. `pnpm test` — zero failing testów
3. `pnpm dev` → smoke test: kluczowy flow sprintu działa end-to-end
4. Swagger `/v1/docs` — nowe endpointy widoczne i poprawne
5. Seed data rozszerzony o dane z nowego sprintu

---

### Sprint 0 (dzień 1–2) — Scaffold + Design System + CI/CD

> Dwudniowy sprint infrastrukturalny. Tworzy fundament repo, design system, pipeline CI/CD i seed data.

**Agent INFRA-REPO — Scaffold monorepo + Docker + CI/CD** `(równolegle z DS-0 i INFRA-DX)`

Prompt:
> Stwórz monorepo Turborepo z pnpm workspaces. 3 aplikacje Next.js (client PWA, provider panel, landing) + 1 NestJS API + shared packages. Skonfiguruj: TypeScript strict, ESLint (shared config), Prettier, husky pre-commit (lint-staged). Połącz z Postgres via Prisma ORM — **pusty schemat** (tabele tworzy BE-1a w Sprint 1). Docker Compose do local dev: Postgres 16 + NestJS API (hot reload) + mailpit (preview emaili). GitHub Actions CI: lint → test → build → deploy staging (Railway). `.env.example` z WSZYSTKIMI wymaganymi zmiennymi (patrz konwencje Env vars powyżej, placeholder values).

Output:
```
/apps/client/          — Next.js 14+ (App Router, PWA manifest)
/apps/provider/        — Next.js 14+ (App Router)
/apps/landing/         — Next.js 14+ (Static export)
/apps/api/             — NestJS (pusty, /v1/health endpoint)
/packages/shared-types/ — pusty (interfejsy tworzy BE-1a)
/packages/design-tokens/ — JSON tokens (colors, spacing, typography)
/packages/eslint-config/
.env.example
docker-compose.yml
turbo.json
.github/workflows/ci.yml
```

Referencje: architektura.md sekcje 5.1, 8, 11.3.
DoD: `pnpm dev` startuje 4 apki, `/v1/health` OK, `docker compose up` → Postgres + API, CI green, `.env.example` kompletny.

**Agent INFRA-DX — Swagger + OpenAPI client + MSW infra + Sentry** `(równolegle z INFRA-REPO)`

Prompt:
> Na scaffoldzie z INFRA-REPO dodaj developer experience tooling: (1) NestJS Swagger plugin → auto-generacja OpenAPI spec na `/v1/docs`. (2) Script `pnpm generate:api-client` — `openapi-typescript` → `/packages/api-client/` (typed fetch wrapper). Na razie generuje placeholder z /health. (3) MSW setup w obu Next.js apkach — TYLKO infrastruktura: `msw` init, `worker.ts`, folder `/mocks/handlers/` z jednym placeholder handlerem. Env var `NEXT_PUBLIC_API_MOCK=true` w dev. FE agenty dopiszą konkretne handlery w kolejnych sprintach. (4) Sentry SDK w każdej apce (placeholder DSN z .env). (5) Pusty `prisma/seed.ts` — skeleton z komentarzem „// Seed wypełnia BE-1a w Sprint 1 po stworzeniu schematu".

Output:
```
/apps/api/src/swagger.config.ts
/packages/api-client/          — typed fetch (placeholder /health)
/apps/client/mocks/            — MSW worker + handlers/ (placeholder)
/apps/provider/mocks/          — MSW worker + handlers/ (placeholder)
/apps/api/prisma/seed.ts       — pusty skeleton
package.json scripts: generate:api-client
```

Referencje: A:14.1 (konwencje API).
DEPENDS ON: INFRA-REPO (potrzebuje istniejącego repo).
DoD: `/v1/docs` Swagger, `pnpm generate:api-client` działa, MSW worker startuje w dev, Sentry initialized.

**Agent DS-0 — Design System + Base Components** `(równolegle z INFRA)`

Prompt:
> Stwórz pakiet `/packages/design-system` z 10 base komponentami wielokrotnego użytku (React). Komponenty: Button (primary/secondary/ghost + disabled + loading), Input (text/phone/email + error state + label), Badge (kolorowy per status: PENDING=żółty, CONFIRMED=zielony, COMPLETED=niebieski, CANCELLED=czerwony, NO_SHOW=szary), Card (wrapper z shadow + border), Modal (overlay + close), BottomTabBar (3 tabs: Szukaj/Rezerwacje/Profil z active state), SideMenu (B2B navigation, collapsible), Spinner (loading), Toast (success/error/info — wraps react-hot-toast), EmptyState (ilustracja + tytuł + CTA). Wszystko stylowane design tokenami z `/packages/design-tokens`. Semantic HTML + ARIA. Dodaj Storybook z jednym story per komponent.

Output:
```
/packages/design-system/src/
  Button.tsx, Input.tsx, Badge.tsx, Card.tsx, Modal.tsx,
  BottomTabBar.tsx, SideMenu.tsx, Spinner.tsx, Toast.tsx, EmptyState.tsx
/packages/design-system/.storybook/
```

Referencje: architektura.md sekcja 6 (Design System), design-tokens.
DoD: `pnpm storybook` → 10 komponentów widocznych. Każdy responsywny, accessible (semantic HTML + ARIA), stylowany tokenami. Eksportowalne jako `@opony/design-system`.

---

### Sprint 1 (tydzień 1) — Auth + Profil + Rejestracja providera

**Agent BE-1a — Schema + Seed + Shared types** — **SCHEMA OWNER (cały Sprint 1)** `(0,5 dnia)`

Prompt:
> Stwórz PEŁNY schemat Prisma dla MVP v0 — WSZYSTKIE tabele z S:13.1: User, Vehicle, OtpToken, ConsentLog, Provider, ProviderPhoto, PricingTier, WorkingHours, ScheduleException, Booking, Review, Payment, WaitlistSignup, AuditLog. Dodaj enumy (Role, BookingStatus, ProviderStatus, PaymentStatus, PaymentMethod, ConsentType). Dodaj indeksy i unique constraints zgodnie z S:13.5 (partial unique index na Booking!). Wygeneruj migrację `npx prisma migrate dev --name init`.
>
> Wypełnij `seed.ts`: 3 klientów (z 1–2 pojazdami każdy), 5 providerów APPROVED w Nowym Sączu (z PricingTier, WorkingHours Pn–Pt 8–18 + Sb 9–14), 20 rezerwacji (mix statusów: 5 PENDING, 5 CONFIRMED, 5 COMPLETED, 3 CANCELLED, 2 NO_SHOW), 10 reviews z odpowiedziami. Hasła testowe providerów: `Test1234567`.
>
> Stwórz shared-types w `/packages/shared-types/`: interfejsy TS dla każdej encji + enumy + DTO response types.

Output:
```
/apps/api/prisma/schema.prisma — PEŁNY schemat (ALL tabele)
/apps/api/prisma/migrations/   — init migration
/apps/api/prisma/seed.ts       — pełne dane testowe
/packages/shared-types/src/    — User, Vehicle, Provider, Booking, Payment, Review... interfaces + enums
```

Referencje: S:13.1 (ALL tables), S:13.5 (constraints).
DoD: `npx prisma migrate deploy` → 14 tabel w DB. `pnpm seed` → dane testowe. Shared-types eksportowalne. **Commit + push jako PIERWSZY (inni agenty rebase'ują).**

**Agent BE-1b — Auth logic + User + Vehicle** `(US-01, US-45, US-02, US-03)` — starts after BE-1a

Prompt:
> Na gotowym schemacie Prisma (z BE-1a) zbuduj moduł autentykacji SMS OTP w NestJS. NIE twórz migracji — schemat istnieje.
>
> Endpointy: POST /v1/auth/otp/request, /verify, /refresh, /logout (A:14.2). Profil: GET/PATCH /v1/me, CRUD /v1/me/vehicles (A:14.3). JWT: access 15 min + refresh 30 dni (Passport JWT strategy). Rate limit OTP: 3/15min/phone (NestJS Throttler). Twilio SDK — SMS z 6-cyfrowym kodem (bcrypt hash w OtpToken). ConsentLog check: jeśli nowy user bez zgód → `requiresConsent: true` w auth response. POST /v1/me/consent — zapisz zgody.
>
> Guardy: `@RequireRole(...roles)`, `@Public()` (skip auth). Walidacja DTO: class-validator. Dodaj nowe zmienne do `.env.example`: JWT_SECRET, TWILIO_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE.

Output:
```
/apps/api/src/auth/     — module, controller, service, jwt.strategy, otp.strategy, guards, decorators
/apps/api/src/user/     — module, controller, service
/apps/api/src/vehicle/  — module, controller, service
/apps/api/src/sms/      — TwilioSmsService (implements SmsService interface)
```

Referencje: S:13.1 (User, Vehicle, OtpToken, ConsentLog), A:14.2, A:14.3, architektura.md 18.2 (SMS), US-01, US-45, US-02, US-03.
DEPENDS ON: BE-1a (schemat musi istnieć).
DoD: Swagger `/v1/docs`, pełny OTP flow (request → verify → JWT → refresh → logout), CRUD vehicles z walidacją, consent flow. Testy ≥ 5.

**Agent BE-2 — Provider onboarding + GUS** `(US-43, US-18)` — **STARTS AFTER BE-1 MIGRATIONS**

Prompt:
> Zbuduj moduł onboarding providera w NestJS. WAŻNE: schemat Prisma już istnieje (stworzony przez BE-1) — NIE twórz migracji, tylko buduj logikę biznesową na istniejących tabelach.
>
> Endpointy: POST /v1/provider/signup (tworzy User PROVIDER_OWNER + Provider PENDING_NIP), POST /v1/provider/me/verify-nip (call GUS BIR API → walidacja NIP + PKD 45.20.Z; fallback CEIDG dla JDG — patrz architektura.md sekcja 18.1), GET/PATCH /v1/provider/me (A:14.6, A:14.7). Przy signup: utwórz User z `role=PROVIDER_OWNER` + Provider z `PENDING_NIP`. Nie ma hasła. Email służy do komunikacji (Resend), nie do auth. Guard `@RequireProviderOwner()` — sprawdź role + providerId z JWT. Status flow: PENDING_NIP → PENDING_DOCS → PENDING_APPROVAL → APPROVED (waliduj przejścia).
>
> Provider loguje się tym samym SMS OTP co klient. Przy rejestracji (POST /v1/provider/signup) utwórz User z `role=PROVIDER_OWNER` + Provider z `PENDING_NIP`. Nie ma hasła. Email służy do komunikacji (Resend), nie do auth.

Output:
```
/apps/api/src/provider/       — module, controller, service
/apps/api/src/provider/gus/   — GUS BIR + CEIDG service (z mockiem do testów)
/apps/api/src/email/          — Resend service (notifications)
```

Referencje: S:13.1 (Provider + related), A:14.6, A:14.7, architektura.md 18.1, US-43, US-18.
DEPENDS ON: BE-1 (migracje muszą istnieć).
DoD: Provider signup → NIP verify (mock GUS) → status flow. Auth przez wspólny OTP (brak hasła). Testy ≥ 3.

**Agent FE-1 — Klient: OTP + Regulamin + Profil + Pojazdy** `(US-01, US-45, US-02, US-03)`

Prompt:
> Zbuduj flow logowania klienta w Next.js PWA. **Startuj od dnia 1 z MSW mockami** (handlers z Sprint 0) — integracja z realnym API gdy BE-1 skończy.
>
> 4 ekrany: (1) Login — numer telefonu (W:12.16 ekran 1), (2) OTP — 6-cyfrowy kod, countdown 60s, 3 próby (W:12.16 ekran 2), (3) Zgody RODO — only first-time, 2 obowiązkowe + 1 opcjonalna (W:12.16 ekran 3), (4) Profil — imię, nazwisko, email, adres domowy z geocoding (W:12.11 górna część). CRUD pojazdów (W:12.11 sekcja „Moje pojazdy") — lista, dodaj (React Hook Form + Zod: regex `^\d{3}/\d{2}\s?R\d{2}$`), edytuj, usuń.
>
> Użyj komponentów z `@opony/design-system` (Button, Input, BottomTabBar, Card, Toast). Auth state: React Context `AuthProvider` z JWT w httpOnly cookie. API calls przez typed client z `@opony/api-client`.

Output:
```
/apps/client/app/(auth)/login/page.tsx
/apps/client/app/(auth)/otp/page.tsx
/apps/client/app/(auth)/consent/page.tsx
/apps/client/app/(main)/profile/page.tsx
/apps/client/app/(main)/profile/vehicles/page.tsx
/apps/client/lib/auth-context.tsx
/apps/client/mocks/ — MSW handlers (rozszerzenie)
```

Referencje: W:12.16, W:12.11, US-01, US-45, US-02, US-03, `@opony/design-system`.
DoD: Flow login → OTP → consent → profil (z MSW, potem z real API). Pojazdy CRUD. Responsive mobile-first. Zod walidacja.

**Agent FE-2 — B2B: Onboarding wizard krok 1** `(US-43, US-18)`

Prompt:
> Zbuduj krok 1/3 wizardu rejestracji providera w Next.js (provider panel). **Startuj z MSW mockami**.
>
> Ekran W:12.15 krok 1: checkboxy regulamin/RODO/marketing (React Hook Form, Zod — 2 required), pole NIP (10 cyfr, mask input) z auto-fill z GUS (call `/v1/provider/me/verify-nip` → wypełnij nazwę, adres), pola: telefon, email, IBAN (walidacja PL format). Brak pola hasła — auth przez SMS OTP. Progress bar ● ○ ○. CTA „Dalej → Zdjęcia" disabled bez required fields.
>
> Użyj `@opony/design-system` (Button, Input, Card). `@opony/api-client` dla API calls.

Output:
```
/apps/provider/app/(onboarding)/signup/page.tsx
/apps/provider/app/(onboarding)/layout.tsx  — progress bar
/apps/provider/components/NipAutoFill.tsx
/apps/provider/mocks/ — MSW handlers
```

Referencje: W:12.15 krok 1, US-43, US-18, `@opony/design-system`.
DoD: Formularz zgodny z wireframe, NIP auto-fill (MSW → real API), walidacje Zod, przejście do kroku 2.

---

**Checklista integracyjna Sprint 1:**
- [ ] `pnpm build` — zero errors
- [ ] OTP login klienta → JWT → GET /v1/me → profil
- [ ] Provider signup → NIP verify → status PENDING_DOCS
- [ ] Swagger `/v1/docs` — endpointy auth + provider widoczne
- [ ] Seed data rozszerzony (klienci + providerzy)

---

### Sprint 2 (tydzień 2) — Katalog + Mapa

**Agent BE-3 — Provider listing + availability** `(US-38, US-04a, US-04b, US-05, US-06)` — **SCHEMA OWNER** (jeśli nowe tabele)

Prompt:
> Zbuduj endpointy katalogu providerów. GET /v1/providers (publiczny, @Public, bez auth) — query: city, lat, lng, tireSize, date, sort (distance/price/rating), page (20/stronę). Dla każdego providera oblicz: dystans (haversine: `acos(sin(lat1)*sin(lat2) + cos(lat1)*cos(lat2)*cos(lng2-lng1)) * 6371` w raw SQL / Prisma `$queryRaw`), cenę per tireSize (lookup PricingTier), najbliższy wolny slot (generuj sloty z WorkingHours − ScheduleException − istniejące Booking WHERE status IN (PENDING, CONFIRMED, IN_PROGRESS)). GET /v1/providers/:slug — szczegóły + cennik + godziny + top 3 opinie. GET /v1/providers/:slug/availability — sloty per dzień na 7 dni do przodu (A:14.4 response format). GET /v1/providers/:slug/reviews — paginacja, sortowanie (newest, rating_desc, rating_asc), filtrowanie po gwiazdkach. Walidacja: zwracaj tylko APPROVED providerów.
>
> Update OpenAPI spec po dodaniu endpointów. Rozszerz seed o dane slotów (WorkingHours dla 5 providerów).

Output:
```
/apps/api/src/catalog/        — module, controller, service
/apps/api/src/availability/   — slot generation service
/apps/api/src/review/         — module (read-only)
```

Referencje: S:13.1 (Provider, PricingTier, WorkingHours, Booking), A:14.4, US-38, US-04a, US-04b.
DoD: `/v1/providers?lat=49.62&lng=20.69&tireSize=205/55R16&sort=distance` → lista z cenami/slotami. `/v1/providers/:slug/availability` → 7 dni slotów. Testy: pusta lista, 1 provider, sortowanie, filtrowanie.

**Agent FE-3 — Klient: Lista + Mapa + Filtry** `(US-38, US-04a, US-04b, US-05, US-06)` — **startuje z MSW od dnia 1**

Prompt:
> Zbuduj główny ekran klienta — wyszukiwarka providerów. **Dzień 1–2: buduj z MSW mockami** (handlers na `/v1/providers` zwracające seed data z Sprint 0). **Dzień 3–5: swap na realny API z BE-3.**
>
> 2 widoki (toggle): lista kart (W:12.1) i mapa Google (W:12.13). Na starcie: browser Geolocation API → jeśli denied, dropdown „Wybierz miasto" (v0: tylko Nowy Sącz). Karta providera (`@opony/design-system Card`): logo, nazwa, ocena (Badge), dystans, cena „180 zł / wymiana 4 opon" (jawny label!), najbliższy slot. Filtry: [Dziś][Jutro][Weekend] chips + sortowanie dropdown. Search box (debounce 300ms, filtruje po nazwie client-side). Mapa: `@googlemaps/js-api-loader`, piny z oceną, tap → mini-karta z CTA. Empty states (`@opony/design-system EmptyState`): brak pojazdu, brak providerów (waitlist form), wszyscy zajęci.
>
> Użyj `@opony/api-client` (typed fetch). Filtrowanie client-side na załadowanej liście (bez re-requestu do API).

Output:
```
/apps/client/app/(main)/search/page.tsx
/apps/client/components/ProviderCard.tsx
/apps/client/components/ProviderMap.tsx
/apps/client/components/FilterBar.tsx
/apps/client/components/SearchBox.tsx
```

Referencje: W:12.1, W:12.13, US-38, US-04a, US-04b, US-05, US-06, US-40, `@opony/design-system`.
DoD: Lista i mapa z danymi (MSW, potem real API). Filtry + sort. Geolokalizacja z fallback. 3 empty states. Responsive.

**Checklista integracyjna Sprint 2:**
- [ ] Otwórz client PWA → mapa z 5 providerami z seeda
- [ ] Filtry: „Dziś" → lista się kurczy; sortowanie: cena → inna kolejność
- [ ] Klik na provider → przejście do profilu (placeholder na razie)
- [ ] Empty state: wpisz miasto „Wrocław" → waitlist form

---

### Sprint 3 (tydzień 3) — Rezerwacja + Płatności

**Agent BE-4 — Booking + Payment P24** `(US-08a–c, US-09, US-50, US-10)` — **SCHEMA OWNER**

Prompt:
> Zbuduj moduł rezerwacji + płatności w NestJS. Tabele Booking + Payment (migracja Prisma — jeśli nie istnieją z Sprint 0 seed).
>
> POST /v1/bookings — waliduj: slot wolny (`SELECT ... FOR UPDATE` w transakcji Prisma `$transaction`), adres w strefie (haversine ≤ serviceRadiusKm), pojazd należy do klienta (vehicleId z JWT userId), klient nie zbanowany. Utwórz Booking (PENDING) + Payment (INITIATED). Wygeneruj `paymentUrl` z **Przelewy24 REST API v2** (sandbox: `sandbox.przelewy24.pl`, env vars: `P24_MERCHANT_ID`, `P24_API_KEY`, `P24_CRC`). Redirect flow: client → P24 → bank → callback → return URL. Zwróć `{booking, paymentUrl}`. Webhook POST /v1/webhooks/p24 (weryfikacja podpisu CRC) → Payment COMPLETED → wyślij SMS potwierdzenie (Twilio). Nagłówek `Idempotency-Key` → sprawdź w tabeli / Redis.
>
> Race condition: unique partial index `(providerId, startAt) WHERE status IN (PENDING, CONFIRMED, IN_PROGRESS)` — catch unique violation → 409 + `GET /v1/providers/:slug/availability` → 3 alternatywne sloty w response.
>
> GET /v1/me/bookings?status=upcoming|past|all&page= (lista klienta). GET /v1/bookings/:id (szczegóły + ownership check). GET /v1/bookings/:id/payment (status płatności). POST /v1/bookings/:id/cancel (US-14 prep — logika refundu: >2h → P24 refund API, <2h → brak).
>
> Kluczowe P24 API calls: `POST /api/v1/transaction/register` (rejestracja), `PUT /api/v1/transaction/verify` (weryfikacja), `POST /api/v1/refund` (zwrot). Sandbox: `sandbox.przelewy24.pl`. Szczegóły: architektura.md sekcja 18.6.
>
> **WAŻNE: Dodaj cron `paymentTimeout`** — co 1 min: `Payment.status = INITIATED AND createdAt < NOW()-15min` → Payment FAILED, Booking CANCELLED_BY_CLIENT, slot zwolniony. Bez tego nieopłacone rezerwacje blokują sloty permanentnie.
>
> Mock P24 w testach unit (interceptor HTTP). Dodaj env vars do `.env.example`: P24_MERCHANT_ID, P24_API_KEY, P24_CRC, P24_CALLBACK_URL.

Output:
```
/apps/api/src/booking/        — module, controller, service, dto
/apps/api/src/payment/        — module, P24 service, webhook controller
/apps/api/src/sms/            — Twilio service (send confirmation)
/apps/api/prisma/migrations/  — Booking, Payment (jeśli jeszcze nie istnieją)
```

Referencje: S:13.1 (Booking, Payment), A:14.5 (flow + endpointy płatności), architektura.md 18.6 (P24 config), US-08a–c, US-50, US-10.
DoD: Flow: create → P24 redirect → webhook → SMS. 409 race condition. Testy ≥ 5 (happy path, 409, address out of zone, payment timeout, cancel+refund).

**Agent FE-4 — Klient: Booking flow + Payment** `(US-08a–c, US-09, US-50, US-10)` — **startuje z MSW**

Prompt:
> Zbuduj flow rezerwacji klienta. **Dzień 1–2 z MSW mockami** (POST /v1/bookings → return fake paymentUrl → redirect → return with success). **Dzień 3–5 swap na real API.**
>
> 4 ekrany: (1) **Minimal provider view** (W:12.2 — uproszczony: nazwa, cennik, godziny, CTA „Zarezerwuj termin"; pełny profil z recenzjami/carousel zbuduje FE-6a w sprincie 5). (2) Wybór slotu (W:12.3) — kalendarz 7 dni, sloty pogrupowane rano/popołudnie/wieczór, adres z `@googlemaps/places` autouzupełnianiem, pole notatki (React Hook Form, Zod max 500 zn.), step indicator ● ● ○, CTA „💳 Zapłać i zarezerwuj [cena] zł". (3) Payment redirect (W:12.8) — ekran „Przekierowuję do Przelewy24…", obsłuż return URL: `?status=success` → ekran 4; `?status=error` → toast + retry. (4) Potwierdzenie (W:12.4) — kod, data, provider, adres, BLIK ✅, info refund, .ics download.
>
> Error handling: 409 → modal „Slot zajęty" + 3 alternatywy (klik = retry). 422 → highlight pola. Toast na 5xx.

Output:
```
/apps/client/app/(main)/provider/[slug]/page.tsx  — MINIMAL view (rozszerzane w sprint 5)
/apps/client/app/(main)/booking/new/page.tsx
/apps/client/app/(main)/booking/payment/page.tsx
/apps/client/app/(main)/booking/confirmed/page.tsx
/apps/client/components/SlotPicker.tsx
/apps/client/components/AddressInput.tsx
/apps/client/components/PaymentStatus.tsx
/apps/client/components/StepIndicator.tsx
```

Referencje: W:12.2 (minimal), W:12.3, W:12.8, W:12.4, US-08a–c, US-09, US-50, US-10, `@opony/design-system`.
DoD: Kompletny flow z MSW, potem real API. P24 redirect + return. Error states. .ics download.

**Checklista integracyjna Sprint 3:**
- [ ] Klient: szukaj → provider → slot → zapłać (P24 sandbox) → potwierdzenie + SMS
- [ ] Double-booking: 2 okna rezerwują ten sam slot → 1 sukces, 1 × 409 z alternatywami
- [ ] Adres poza strefą → inline error
- [ ] `/v1/me/bookings` → lista rezerwacji klienta

---

### Sprint 4 (tydzień 4) — Panel B2B

**Agent BE-5 — Provider panel + S3 upload** `(US-21, US-23, US-24, US-25, US-26)`

Prompt:
> Zbuduj endpointy panelu B2B providera w NestJS.
>
> **Auth providera**: Provider loguje się SMS OTP (te same endpointy co klient — `/v1/auth/otp/*`). Brak oddzielnych endpointów `/v1/provider/auth/*`. Guard `@RequireProviderOwner()` sprawdza `role` z JWT.
>
> Guard: `@RequireProviderOwner()` → sprawdź role + Provider.status. Jeśli status ≠ APPROVED → 403 z `{detail: "Konto w statusie [status]", providerStatus: "PENDING_APPROVAL"}` (FE wyświetli odpowiedni ekran).
>
> **S3 Upload Service** (reużywalny przez Sprint 6 onboarding): `UploadService` — generuje presigned PUT URL (AWS SDK v3), waliduje typ (JPG/PNG) i rozmiar (max 5 MB), zapisuje URL w DB (ProviderPhoto / docs). Env vars: AWS_S3_BUCKET, AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_REGION. Dodaj do `.env.example`.
>
> Endpointy (prefix /v1/provider/me): GET/PATCH (profil), GET/PUT /pricing (3 widełki), GET/PUT /working-hours (7 dni + slotMinutes), GET/POST/DELETE /exceptions, GET/POST/DELETE /photos (S3 presigned URL), GET /bookings?from&to&status (lista z paginacją, include klient name+phone+address), POST /bookings/:id/accept|reject|start|complete|cancel — **waliduj przejścia state machine (S:13.3)** — invalid transition → 422 z aktualnym statusem.
>
> Booking actions: accept → SMS do klienta; reject → SMS + trigger refund; complete → trigger settlement (commissionPln, providerPayoutPln).

Output:
```
/apps/api/src/provider-panel/ — module, controller, service
/apps/api/src/upload/         — S3 UploadService (presigned URLs) — REUŻYWALNY
/apps/api/src/booking/        — rozszerzenie: provider-side actions + SMS
```

Referencje: S:13.1, S:13.3 (state machine), A:14.6, US-21, US-23–26.
DoD: Provider auth (SMS OTP → JWT z providerId). CRUD pricing/hours/exceptions/photos (S3). Booking state machine. SMS. Testy ≥ 5.

**Agent FE-5a — B2B: Login + Dashboard** `(US-21, US-26)` — **startuje z MSW**

Prompt:
> Zbuduj core panelu providera. **Dzień 1–2 z MSW** (napisz handlery: GET /v1/provider/me → mock provider, GET /v1/provider/me/bookings → mock 5 rezerwacji z różnymi statusami).
>
> Ekrany: (1) Login SMS OTP (ten sam flow co klient — phone + code, React Hook Form + Zod). Ekran blokady (403 z `providerStatus`). (2) Layout z `@opony/design-system SideMenu`: Dzień, Kalendarz, Cennik, Godziny, Strefa, Opinie 🔴N, Finanse, Ustawienia. (3) Dashboard dnia (W:12.5) — lista chronologiczna z `BookingCard` (imię, adres, dystans, cena, `StatusBadge`, 💳), akcje inline (Akceptuj/Odrzuć/Rozpocznij/Zakończ → call API → optimistic update), obrót brutto/netto, pending payout.

Output:
```
/apps/provider/app/(auth)/login/page.tsx        — phone + OTP code (reuse klient flow)
/apps/provider/app/(auth)/blocked/page.tsx
/apps/provider/app/(main)/layout.tsx — SideMenu + header
/apps/provider/app/(main)/dashboard/page.tsx
/apps/provider/components/BookingCard.tsx
/apps/provider/mocks/handlers/provider.ts
```

Referencje: W:12.5, US-21, US-26, `@opony/design-system`.
DoD: Login → dashboard z rezerwacjami. Akcje inline. Layout z menu. Responsive.

**Agent FE-5b — B2B: Cennik + Godziny + Strefa + Profil** `(US-23, US-24, US-25)` — **startuje z MSW**

Prompt:
> Rozbuduj panel providera (na layoucie z FE-5a). **MSW handlery** na: GET/PUT /v1/provider/me/pricing, GET/PUT /v1/provider/me/working-hours, GET/POST/DELETE /v1/provider/me/exceptions, GET/POST/DELETE /v1/provider/me/photos.
>
> Ekrany: (1) Cennik (W:12.7 top) — 3 widełki + dopłaty (React Hook Form + Zod: positive numbers). (2) Godziny (W:12.7 mid) — 7 dni × open/close/slotMinutes + toggle nieczynne + wyjątki (lista + dodaj/usuń). (3) Strefa (W:12.7 bottom) — Google Maps `@googlemaps/js-api-loader` z draggable markerem + input promień km. (4) Profil — opis (textarea 2000 zn), logo (single upload), galeria do 10 zdjęć (drag-and-drop `react-dropzone`, S3 presigned URL, preview thumbnails).

Output:
```
/apps/provider/app/(main)/pricing/page.tsx
/apps/provider/app/(main)/hours/page.tsx
/apps/provider/app/(main)/zone/page.tsx
/apps/provider/app/(main)/profile/page.tsx
/apps/provider/components/PhotoGallery.tsx
/apps/provider/mocks/handlers/pricing.ts, hours.ts
```

Referencje: W:12.7, US-23, US-24, US-25, `@opony/design-system`.
DoD: 4 ekrany CRUD z formularzami. Upload zdjęć do S3. Mapa ze strefą. Zod walidacja.

**Checklista integracyjna Sprint 4:**
- [ ] Provider login (SMS OTP) → dashboard z rezerwacjami z seeda
- [ ] Akceptuj rezerwację → status CONFIRMED, klient SMS
- [ ] Edycja cennika → save → reload → zachowane
- [ ] Upload zdjęcia profilu → S3 → widoczne
- [ ] Provider PENDING_APPROVAL → ekran blokady

---

### Sprint 5 (tydzień 5) — Oceny + Rozliczenia

**Agent BE-6 — Reviews + Settlement + Refund** `(US-16, US-17, US-48, US-51, US-52, US-07)`

Prompt:
> Rozbuduj moduły: (1) Review — POST /bookings/:id/review (tylko COMPLETED, max 90 dni, 1000 znaków, filtr wulgaryzmów — lista słów PL), GET /providers/:slug/reviews (paginacja + rozkład %, sortowanie, filtrowanie po gwiazdkach). Pole seenByProvider. (2) Settlement — po Booking COMPLETED: oblicz commissionPln (8%), providerPayoutPln. Cron weeklyPayouts (pon 6:00): zbierz PENDING payouts → batch (v0: zmień status na PAID, wyślij email summary). (3) Refund — POST /bookings/:id/cancel: jeśli client > 2h → P24 refund API → Payment.status REFUNDED. Jeśli < 2h → brak refundu. Jeśli provider cancel → zawsze refund. (4) Rozbuduj GET /providers/:slug — dodaj avgRating, reviewCount, pełny cennik, godziny.

Output:
```
/apps/api/src/review/         — pełny CRUD + filtr wulgaryzmów
/apps/api/src/settlement/     — cron service + payout logic
/apps/api/src/payment/        — refund logic (rozszerzenie)
/apps/api/src/catalog/        — rozszerzenie: pełny profil providera
```

Referencje: S:13.1 (Review, Payment), A:14.5, US-16, US-17, US-48, US-51, US-52.
DoD: Review CRUD + filtr. Settlement cron z logami. Refund flow P24. Profil providera kompletny.

**Agent FE-6a — Klient: PEŁNY profil providera + Oceny** `(US-07, US-16, US-17)` — **startuje z MSW**

Prompt:
> WAŻNE: W sprint 3 (FE-4) zbudowano minimalny widok providera `/provider/[slug]` (tylko nazwa, cennik, godziny, CTA booking). Teraz **rozbudowujesz tę stronę** do pełnego profilu (W:12.2): dodaj carousel zdjęć (swipe), sekcję „O nas" (opis), przycisk ♡ „Dodaj do ulubionych" (localStorage + API), przycisk „Udostępnij" (Web Share API / fallback clipboard), pełna sekcja opinii (top 3 + „zobacz wszystkie →"). NIE przepisuj od zera — rozszerzaj istniejący plik.
>
> Nowe ekrany: (1) Formularz oceny (W:12.12) — gwiazdki 1–5 (tap), komentarz React Hook Form + Zod (max 1000 zn z licznikiem), CTA „Wyślij" + „Pomiń — oceń później". Dostępny tylko po COMPLETED (sprawdź status booking). (2) Lista opinii fullpage (W:12.17) — rozkład % (progress bars), filtry chips po ⭐, sortowanie, odpowiedzi providera, badge „✓ Zweryfikowany klient". Lazy loading (`IntersectionObserver` + paginacja API).

Output:
```
/apps/client/app/(main)/provider/[slug]/page.tsx — ROZSZERZENIE (carousel, opis, ulubione, share)
/apps/client/app/(main)/provider/[slug]/reviews/page.tsx — lista pełna
/apps/client/app/(main)/booking/[id]/review/page.tsx
/apps/client/components/RatingForm.tsx
/apps/client/components/ReviewList.tsx
/apps/client/components/RatingDistribution.tsx
/apps/client/components/PhotoCarousel.tsx
```

Referencje: W:12.2 (full), W:12.12, W:12.17, US-07, US-16, US-17, `@opony/design-system`.
DoD: Profil providera kompletny (carousel, opis, opinie, ulubione, share). Rating form działa. Lista opinii z rozkładem + filtry.

**Agent FE-6b — B2B: Opinie + Finanse** `(US-48, US-51, US-53)` — **startuje z MSW**

Prompt:
> Rozbuduj panel providera: (1) Sekcja „Opinie" — lista opinii z przyciskami „Odpowiedz" (tekst, 1 odpowiedź/opinię, edit 24h) + „Zgłoś" (kategoria + komentarz). Badge new reviews. (2) Sekcja „Finanse" (W:12.14) — saldo, pending payout z datą, brutto/prowizja/netto, historia wypłat, email export.

Output:
```
/apps/provider/app/(main)/reviews/
/apps/provider/app/(main)/finances/
/apps/provider/components/ReviewReplyForm.tsx
/apps/provider/components/ReportForm.tsx
/apps/provider/components/PayoutHistory.tsx
```

Referencje: W:12.14, US-48, US-53, `@opony/design-system`.
DoD: Opinie z reply + zgłoś. Finanse z saldem i historią wypłat.

---

### Sprint 6 (tydzień 6) — Onboarding + Historia + System

**Agent BE-7 — Upload + Admin + Crons** `(US-19, US-44, US-20, US-36, US-11)`

Prompt:
> Zbuduj: (1) File upload — POST /provider/me/docs (multipart, max 5MB, JPG/PNG → S3, update status PENDING_DOCS → PENDING_APPROVAL). (2) Admin endpoints — GET /admin/providers?status=PENDING_APPROVAL, POST /admin/providers/:id/approve|reject|suspend (A:14.8). Przy reject: kategoria powodu → SMS + email do providera (US-44). Przy approve: SMS + email „konto aktywne". (3) Cron markNoShows — co 5 min: CONFIRMED + startAt < NOW()-30min → NO_SHOW + noShowCount++. (4) Cron adminPendingAlert — codziennie 9:00: email z listą PENDING_APPROVAL. (5) SMS przypomnienia (US-11): po CONFIRMED → schedule 2 SMS (24h i 1h przed). Przy anulowaniu → unieważnij scheduled.

Output:
```
/apps/api/src/upload/         — S3 service + multer config
/apps/api/src/admin/          — module, controller, service
/apps/api/src/cron/           — NestJS @Cron: noShow, adminAlert, reminders
/apps/api/src/sms/            — rozszerzenie: scheduled SMS
```

Referencje: S:13.1, A:14.8, US-19, US-44, US-20, US-36, US-11.
DoD: Upload do S3. Admin approve/reject z SMS. Cron NO_SHOW. Przypomnienia scheduled.

**Agent FE-7a — Klient: Rezerwacje lista + szczegół + RODO** `(US-12, US-13, US-46)`

Prompt:
> Zbuduj: (1) Lista rezerwacji (W:12.9) — tabs Nadchodzące/Historia, karta: data, provider, status badge kolorem, cena, 💳 status. Pusta lista → CTA „Znajdź punkt". (2) Szczegół rezerwacji (W:12.10) — pełne dane, timeline statusów, akcje per status (Anuluj, Zmień termin, Oceń), info o refundzie, „Dodaj do kalendarza". (3) Profil sekcja ustawienia: „Usuń konto" z dialogiem potwierdzającym + „Pobierz dane" mailto.

Output:
```
/apps/client/app/(main)/bookings/
/apps/client/app/(main)/bookings/[id]/
/apps/client/components/BookingCard.tsx
/apps/client/components/StatusTimeline.tsx
/apps/client/app/(main)/profile/settings/
```

Referencje: W:12.9, W:12.10, W:12.11 (ustawienia), US-12, US-13, US-46, `@opony/design-system`.
DoD: Lista rezerwacji (tabs + badge), szczegół z timeline + akcjami, settings RODO. Responsive.

**Agent FE-7b — B2B: Onboarding wizard kroki 2–3** `(US-19, US-44)` — **startuje z MSW**

Prompt:
> Dokończ wizard: (1) Krok 2/3 „Materiały" (W:12.15 krok 2) — upload 3 zdjęć (drag-and-drop z `react-dropzone` + preview thumbnails), walidacja JPG/PNG max 5MB, progress bar uploadu (presigned URL → S3 PUT). Po uploadzie wszystkich 3 → call API → status PENDING_APPROVAL. (2) Krok 3/3 „Weryfikacja" (W:12.15 krok 3) — ekran oczekiwania z animacją + info „sprawdzimy w 24h". (3) Ekran post-rejection (US-44): komunikat z kategorią powodu + mailto CTA `kontakt@opony.app`.

Output:
```
/apps/provider/app/(onboarding)/photos/page.tsx
/apps/provider/app/(onboarding)/verification/page.tsx
/apps/provider/app/(onboarding)/rejected/page.tsx
/apps/provider/components/PhotoUploader.tsx
```

Referencje: W:12.15 kroki 2–3, US-19, US-44, `@opony/design-system`.
DoD: Upload z drag-and-drop + preview. Status flow PENDING_DOCS → PENDING_APPROVAL. Ekran rejection z mailto.

**⚠ HUMAN TASK: RETOOL — Admin panel** `(US-20)`

> To NIE jest zadanie dla agenta AI — Retool Cloud konfiguruje się przez GUI (klik-klik), nie przez kod. Founder/dev konfiguruje ręcznie.

Instrukcja krok po kroku:
1. Załóż konto Retool Cloud → nowy app „Opony Admin".
2. Dodaj Resource: Postgres (connection string z Railway + read/write user).
3. Dodaj Resource: REST API (base URL: `https://api.opony.app/v1`, header `Authorization: Bearer <admin_jwt>`).
4. Zbuduj 5 ekranów:
   - **Providers**: tabela `SELECT * FROM "Provider"` + filtry status + akcje Approve/Reject (REST POST).
   - **Bookings**: tabela `SELECT * FROM "Booking" JOIN "User"...` + filtry + audit log.
   - **Reviews**: `reported=true` + akcja Hide.
   - **Users**: wyszukiwanie + ban.
   - **Dashboard**: SQL charts (rez/dzień, revenue/mc, nowi providerzy).
5. Akcje modyfikujące TYLKO przez REST API — NIGDY direct SQL UPDATE.

Referencje: A:14.8, architektura.md 18.4.
DoD: Admin loguje się → PENDING_APPROVAL → approve → provider SMS. Czas: ~3h pracy manualnej.

**Checklista integracyjna Sprint 6:**
- [ ] Provider onboarding: signup → NIP → upload zdjęć → PENDING_APPROVAL
- [ ] Admin (Retool): approve provider → SMS do providera „konto aktywne"
- [ ] Admin: reject → provider widzi ekran rejection z kategorią
- [ ] Klient: lista rezerwacji (nadchodzące + historia)
- [ ] Cron NO_SHOW: rezerwacja sprzed 35 min → automatycznie NO_SHOW
- [ ] Przypomnienie SMS: 24h przed → SMS wysłany

---

### Sprint 7 (tydzień 7) — Polish + Systemowe + Soft-launch

**Agent BE-8a — B2B szczegół + Manual booking + Eskalacja** `(US-28, US-29, US-30)`

Prompt:
> Zbuduj: (1) Rozszerz GET /v1/provider/me/bookings/:id — dodaj payment info (commissionPln, providerPayoutPln, payoutStatus), timeline historii statusów (query AuditLog WHERE entity='Booking' AND entityId=:id ORDER BY createdAt). (2) Powiadomienia (US-29): SMS + email do providera przy nowej PENDING. Cron eskalacji: co 2h sprawdza PENDING bez reakcji (confirmedAt IS NULL AND createdAt < NOW()-2h) → re-SMS. Po 6h → SMS z prefixem „PILNE". (3) POST /v1/provider/me/bookings (manual add, US-30): body {clientPhone, tireSize, startAt, address, notes} → znajdź User po phone LUB utwórz nowego (role CLIENT) → Booking CONFIRMED + Payment mock (ON_SITE — manual booking nie ma płatności online). SMS do klienta jeśli ma konto.

Output:
```
/apps/api/src/provider-panel/ — rozszerzenie: booking detail + manual add
/apps/api/src/notification/   — eskalacja service + cron
```

Referencje: A:14.6, US-28, US-29, US-30.
DoD: Booking detail z payment info + timeline. Manual booking działa. Eskalacja SMS co 2h. Testy ≥ 3.

**Agent BE-8b — Crony systemowe** `(US-37, US-55)`

Prompt:
> Zbuduj/dokończ crony NestJS `@Cron`: (1) `updateRatingCache` — co 1h: `UPDATE Provider SET avgRating = (SELECT AVG(rating) FROM Review WHERE providerId = Provider.id AND isHidden = false), reviewCount = (SELECT COUNT(*) ...)`. (2) `weeklyPayouts` — pon 6:00: zbierz `Payment WHERE payoutStatus = 'PENDING' AND Booking.status = 'COMPLETED'` → batch: ustaw payoutStatus = PAID, paidOutAt = NOW(), wyślij email do providera z podsumowaniem (Resend). (3) `adminPendingAlert` — codziennie 9:00: email do admina z listą PENDING_APPROVAL. (4) UWAGA: cron `paymentTimeout` już istnieje z Sprint 3 (BE-4) — sprawdź czy działa, nie duplikuj.

Output:
```
/apps/api/src/cron/ — rating.cron.ts, payout.cron.ts, admin-alert.cron.ts
```

Referencje: A:14.9, US-37, US-55.
DoD: 3 crony zarejestrowane + testowane (manual trigger + assert DB state). Testy ≥ 3.

**Agent FE-8 — B2B: Szczegół + Manual** `(US-28, US-30)` — **startuje z MSW**

Prompt:
> Zbuduj: (1) Szczegół rezerwacji B2B (W:12.6) — pełne dane klienta (phone jako `tel:` link), adres z miniaturą Google Static Map, notatka, sekcja płatności (brutto/prowizja 8%/netto/data wypłaty), timeline statusów (`StatusTimeline` komponent), akcje kontekstowe: Rozpocznij/Zakończ/Zmień termin/Anuluj/Oznacz NO_SHOW (widoczne per status — patrz S:13.3 reguły przejść). (2) Modal „+ Dodaj wizytę ręcznie" (US-30): formularz telefon + rozmiar opon + wybór slotu (reuse SlotPicker) + adres + notatka. Call POST /v1/provider/me/bookings.

Output:
```
/apps/provider/app/(main)/bookings/[id]/page.tsx
/apps/provider/components/BookingDetail.tsx
/apps/provider/components/ManualBookingModal.tsx
/apps/provider/components/PaymentSection.tsx
/apps/provider/components/StatusTimeline.tsx
```

Referencje: W:12.6, US-28, US-30, `@opony/design-system`.
DoD: Szczegół z payment info + timeline. Manual booking modal. Akcje per status.

**Agent QA-E2E — Playwright testy UI** `(all)`

Prompt:
> Napisz Playwright E2E testy dla 3 kluczowych flow: (1) **Klient happy path**: login OTP (mock Twilio) → szukaj providerów → wybierz slot → zapłać (mock P24 redirect → auto-return success) → ekran potwierdzenia z kodem OPN-XXXX. (2) **Provider happy path**: login SMS OTP (mock Twilio) → dashboard → akceptuj PENDING → rozpocznij → zakończ → rezerwacja COMPLETED. (3) **Provider onboarding**: signup (NIP + phone + email) → NIP (mock GUS) → upload 3 zdjęć → ekran weryfikacji → (manual DB update: status APPROVED) → login OTP → dashboard z danymi.
>
> Użyj seed data z BE-1a (5 providerów, 20 rezerwacji). Mock external services: Twilio (intercept HTTP), P24 (intercept redirect), GUS (intercept API).

Output:
```
/e2e/playwright.config.ts
/e2e/tests/client-booking.spec.ts
/e2e/tests/provider-dashboard.spec.ts
/e2e/tests/provider-onboarding.spec.ts
/e2e/fixtures/       — mock external services
```

Referencje: W:12.16, W:12.1, W:12.3, W:12.4, W:12.5, W:12.15.
DoD: 3 testy E2E green. Czas trwania < 60 s łącznie.

**Agent QA-CRON — Weryfikacja cronów + integration tests** `(all)`

Prompt:
> Napisz skrypty bash/ts do weryfikacji cronów: (1) `test-noshow.sh`: utwórz booking CONFIRMED z startAt = NOW()-35min → trigger cron (curl POST /v1/admin/crons/no-show lub manual NestJS trigger) → assert booking.status = NO_SHOW. (2) `test-payment-timeout.sh`: utwórz Payment INITIATED z createdAt = NOW()-16min → trigger cron → assert Payment.status = FAILED, Booking CANCELLED. (3) `test-rating-cache.sh`: dodaj review 5⭐ → trigger cron → assert Provider.avgRating updated. (4) `test-weekly-payout.sh`: 3 rezerwacje COMPLETED z Payment PENDING → trigger cron → assert payoutStatus = PAID + email sent (check mailpit). Każdy test: setup → trigger → assert → cleanup.

Output:
```
/e2e/cron-tests/test-noshow.sh
/e2e/cron-tests/test-payment-timeout.sh
/e2e/cron-tests/test-rating-cache.sh
/e2e/cron-tests/test-weekly-payout.sh
```

DoD: 4 testy cron green. Każdy idempotentny (cleanup after).

**Checklista integracyjna Sprint 7 (= FINAL pre-launch):**
- [ ] E2E klient: login → szukaj → rezerwuj → zapłać → SMS → potwierdzenie
- [ ] E2E provider: login → dashboard → akceptuj → rozpocznij → zakończ → settlement
- [ ] E2E onboarding: signup → NIP → upload → admin approve → login → dashboard
- [ ] Crony: NO_SHOW ✓, payment timeout ✓, weekly payouts ✓, rating cache ✓, admin alert ✓
- [ ] Seed: 5 providerów, 20 rezerwacji, 10 reviews — widoczne w obu apkach
- [ ] Performance: p95 API < 300 ms, Lighthouse PWA > 80
- [ ] Security: rate limiting OTP, 403 na unauthorized, no SQL injection

---

### Podsumowanie sprintów

| Sprint | Tydzień | SP | Agenty (AI + human) | Focus |
|---:|---:|---:|---|---|
| 0 | dzień 1–2 | — | INFRA-REPO ∥ INFRA-DX ∥ DS-0 (3) | Scaffold + DX + Design System |
| 1 | 1 | 21 | BE-1a → {BE-1b, BE-2} ∥ FE-1 ∥ FE-2 (5) | Auth + Schema + Profil + Rejestracja |
| 2 | 2 | 21 | BE-3 ∥ FE-3 (2) | Katalog + Mapa |
| 3 | 3 | 19 | BE-4 ∥ FE-4 (2) | Rezerwacja + Płatności + paymentTimeout |
| 4 | 4 | 21 | BE-5 ∥ FE-5a ∥ FE-5b (3) | Panel B2B + S3 upload |
| 5 | 5 | 22 | BE-6 ∥ FE-6a ∥ FE-6b (3) | Oceny + Rozliczenia |
| 6 | 6 | 21 | BE-7 ∥ FE-7a ∥ FE-7b + 🧑 RETOOL (3+1 human) | Onboarding + Historia + Admin |
| 7 | 7 | 13+QA | BE-8a ∥ BE-8b ∥ FE-8 ∥ QA-E2E ∥ QA-CRON (5) | Polish + Testy + Soft-launch |
| **RAZEM** | **7+2d** | **138** | **26 agent-zadań + 1 human task** | |

### Zależności między agentami (DAG)

```
Sprint 0: INFRA-REPO ──► INFRA-DX
          DS-0 (równolegle, niezależny)

Sprint 1: BE-1a (schema+seed, 0.5d) ──► BE-1b (auth logic)
                                    ──► BE-2 (provider logic)
          FE-1 (MSW od dnia 1, swap dzień 3)
          FE-2 (MSW od dnia 1, swap dzień 3)

Sprint 2: BE-3 ∥ FE-3 (MSW → real dzień 3)
Sprint 3: BE-4 ∥ FE-4 (MSW → real dzień 3)   ← includes paymentTimeout cron
Sprint 4: BE-5 ∥ FE-5a ∥ FE-5b (MSW → real)  ← includes S3 upload service
Sprint 5: BE-6 ∥ FE-6a ∥ FE-6b (MSW → real)
Sprint 6: BE-7 ∥ FE-7a ∥ FE-7b               + 🧑 RETOOL (human, 3h)
Sprint 7: BE-8a ∥ BE-8b ∥ FE-8 ∥ QA-E2E ∥ QA-CRON
```

**Zasady:**
- Wszystkie FE agenty startują od dnia 1 z **własnymi MSW handlerami** (nie polegają na OpenAPI z Sprint 0)
- BE `schema owner` merge'uje **pierwszy** w sprincie — reszta rebase'uje
- Każdy agent na osobnym branchu `sprint-X/agent-name` → PR do `main`
- Max 2 retry per agent. Po 2 failures → human review.

### Checklist per sprint (obowiązkowy po każdym sprincie)

1. `pnpm build` — zero errors we wszystkich apkach
2. `pnpm test` — zero failing testów
3. Swagger `/v1/docs` — nowe endpointy widoczne
4. Smoke test kluczowego flow sprintu (patrz checklista integracyjna per sprint)
5. Seed data rozszerzony
6. OpenAPI spec zaktualizowany → FE api-client prze-generowany

### SHOULD stories — sprint 8–9 (po soft-launch)

Realizowane indywidualnie jako osobne agent-taski:
- US-14 (anulowanie), US-15 (przełożenie terminu), US-22 (onboarding tutorial), US-27 (kalendarz tygodniowy), US-31–35 (B2B extended), US-39 (search), US-41 (ulubione), US-42 (share), US-47 (zmiana telefonu), US-49 (edycja opinii), US-53 (finanse extended).
