Puste:

API — tylko /v1/health
Panel — jedna strona "scaffold placeholder"
shared-types — pusty plik
Data graniczna: CLIENT_LAUNCH_DATE=2026-05-14 — 20 dni

Krytyczna ścieżka do launch B2B portalu
Sekwencja nie jest arbitralna — każdy krok odblokowuje następny:

Schema DB → shared-types → Auth API → Auth UI
↓
Onboarding API → Onboarding UI
↓
Mgmt API (pricing/hours) → Mgmt UI
↓
Reservations API → Reservations UI
↓
Dashboard
Blok 1 — Prisma schema + shared-types (1 dzień)
To fundament. Bez tego MSW moki nie mają kształtu, API nie ma tabel, frontend nie ma typów.

Tabele do stworzenia:

users — id, phone, role (PROVIDER|CLIENT|ADMIN), created_at
providers — id, user_id, name, nip, city, address, status (PENDING|APPROVED)
pricing_tiers — id, provider_id, width, profile, diameter, price_change, price_rotation
schedules — id, provider_id, day_of_week (0-6), open_time, close_time, is_open
reservations — id, provider_id, client_phone, tire_size, scheduled_at, status, price
ratings — id, reservation_id, score (1-5), comment, created_at
Zony serwisowe — skip dla MVP. Hardcode miasto = Nowy Sącz dla pilotów.

Równolegle — wypełnić packages/shared-types typami odpowiadającymi schematowi.

Blok 2 — Auth module w API (1 dzień)

POST /v1/auth/request-otp — przyjmuje telefon, wysyła SMS (lub logi w dev)
POST /v1/auth/verify-otp — sprawdza kod, zwraca accessToken + refreshToken
POST /v1/auth/refresh — odświeża token
GET /v1/auth/me — dane zalogowanego użytkownika
Ryzyko Twilio: W środowisku dev — logować OTP do konsoli zamiast wysyłać SMS. TWILIO_MOCK=true. To eliminuje zewnętrzną zależność na początku.

JWT guard jako NestJS guard — jeden dekorator @UseGuards(JwtGuard).

Blok 3 — Panel: Login + Onboarding (2 dni)
Strony:

/login — numer telefonu → wyślij kod
/login/verify — pole na 6-cyfrowy kod OTP
/onboarding — redirect po pierwszym logowaniu
/onboarding/company — NIP, nazwa, adres (krok 1/3)
/onboarding/photos — upload zdjęć warsztatu (krok 2/3)
/onboarding/verify — "czekamy na weryfikację" (krok 3/3)
NIP verification przez GUS API — skip dla MVP. Admin ręcznie zatwierdza przez Retool lub bezpośrednio w bazie. To nie blokuje launch.

Zdjęcia — skip upload na S3 dla MVP. Placeholder image, upload dodamy w sprincie 2.

Routing: protected route — jeśli !token → redirect /login, jeśli status === PENDING → /onboarding.

Blok 4 — Panel: Zarządzanie (3 dni)

/dashboard — KPI karty (dzisiejsze wizyty, przychód, ocena średnia)
/pricing — tabela rozmiarów opon + edycja cen (PricingTable komponent gotowy)
/schedule — dni tygodnia + godziny (HoursTable komponent gotowy)
/reservations — lista rezerwacji z filtrami (DataTable komponent gotowy)
/reservations/[id] — szczegóły rezerwacji
/profile — edycja danych firmy
/settings — dane bankowe, hasło, logout
Kluczowa obserwacja: Design system ma gotowe komponenty dla wszystkich tych widoków — PricingTable, HoursTable, DataTable, KPICard, BookingCard, SettingsRow, ContactRow. Panel to głównie złożenie istniejących klocków z prawdziwymi danymi z API.

Blok 5 — Integracja end-to-end (1-2 dni)
pnpm generate:api-client — Swagger → TypeScript typy automatycznie
Zastąpienie MSW mocków prawdziwymi callami przez @opony/api-client
Error handling — Toast dla błędów API (komponent gotowy)
Loading states — Skeleton/Spinner (komponent gotowy)
Walidacja formularzy — zod + react-hook-form
Co można ominąć w MVP (dodać w sprincie 2):
Feature Powód pominięcia
Zony serwisowe Pilot = Nowy Sącz, hardcode wystarczy
Upload zdjęć S3 Placeholder image, setup S3 w sprincie 2
NIP weryfikacja GUS Admin zatwierdza ręcznie na start
SMS Twilio w produkcji OTP przez email/log na początku pilotu
Widok kalendarza Lista rezerwacji wystarczy na start
Oceny i recenzje Nie ma jeszcze klientów
Polska płatność ADR-003: bez płatności w pilotie

Jutro: Auth module w NestJS (z mock OTP w dev) + strona /login i /login/verify w panelu.

Ten tydzień: Onboarding flow + pricing + hours. To wystarczy żeby pokazać pilotowym dostawcom działający portal i zebrać feedback.

Najbezpieczniejszym i najbardziej rekomendowanym podejściem w React jest przechowywanie JWT (JSON Web Tokens) w ciasteczkach HttpOnly i Secure. Łączy to zalety bezstanowości JWT (łatwość skalowania) z ochroną przed atakami XSS, którą dają ciasteczka, uniemożliwiając JavaScriptowi dostęp do tokena. Krótkożyciowy dostęp (access token) w pamięci (stan React), a odświeżanie tokena (refresh token) w bezpiecznym ciasteczku HttpOnly.
