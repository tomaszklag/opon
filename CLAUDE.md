# CLAUDE.md — Opony.app

Pełna dokumentacja developerska: **`docs/developer-guide.md`**. Przeczytaj go przed implementacją.

## Najważniejsze zasady — Panel B2B (`apps/panel`)

- **Tekst = DS komponent.** `<Heading>` lub `<Text>` z `@opony/design-system-web`. Nigdy `font-size/font-weight/line-height/letter-spacing/font-family/color` w CSS module dla elementów tekstowych — zamiast tego użyj propsów `variant`, `weight`, `color`, `mono`.
- **Komponenty UI = DS.** `Input`, `Button`, `Select`, `Spinner` itd. — nigdy natywne HTML jako obejście.
- **Ikony = `apps/panel/components/icons.tsx`.** Nigdy inline SVG.
- **Tokeny = `global.css`.** Jedyne źródło prawdy dla kolorów, spacing, typografii.
- **Typy API = `components['schemas']['XxxResponseDto']`.** Nigdy ręczna definicja.
- **Routing = `canonicalRoute()`.** Nigdy własny `router.replace` z logiką statusów.
- **Klucze API tylko w `apps/api/.env`.** Nigdy w `NEXT_PUBLIC_*` ani w kodzie.
- **Toast = `@opony/design-system-web`.** `import { toast } from '@opony/design-system-web'` — nigdy z `react-hot-toast` bezpośrednio.

## Najważniejsze zasady — Mobile (`apps/mobile`, `packages/design-system-native`)

- **Tekst = DS komponent.** `<Text>` lub `<Heading>` z `@opony/design-system-native`. Nigdy `Text` z `react-native` bezpośrednio — nawet wewnątrz komponentów DS wyższego poziomu.
- **Spacing = tokeny.** Zawsze `t.spacing[N]` z `tokens.native.ts`. Nigdy hardcoded wartości pikselowe w StyleSheet (np. `gap: 4`, `marginTop: 2`). Minimalna jednostka w tokenach to `t.spacing[1]` = 4px; dla mniejszych odstępów użyj 0 lub zaakceptuj 4px.
- **Kolory = tokeny.** `t.colors.xxx` — nigdy inline `rgba(...)` ani hex. Jeśli kolor z przezroczystością nie istnieje w tokenach, dodaj go do **obu plików**: `packages/design-tokens/tokens.json` (Metro/runtime) i `packages/design-tokens/src/index.ts` (typy TS). Samo `src/index.ts` = kolor `undefined` w runtime.
- **Typy API = `components['schemas']['XxxDto']`.** Gdy endpoint `/v1/app/...` jeszcze nie istnieje w `schema.d.ts` (bo kontroler mobilny nie jest zaimplementowany), stwórz tymczasowy `interface` z komentarzem `// TODO: replace with components['schemas']['AppXxxResponseDto'] after BE implementation`. Nie zostawiaj ręcznych typów bez tego komentarza. Wyjątek: gdy endpoint nie zwraca ciała odpowiedzi (np. join waitlist, DELETE), użyj `Promise<void>` — nie twórz pustego interface z TODO.
- **Toast = `useToast()`.** `import { useToast } from '@opony/design-system-native'` — nigdy z innej biblioteki.
- **Auth guard (expo-router v6) = `useSegments + useEffect`.** Projekt używa wzorca `AuthGuard` komponentu jak w `app/_layout.tsx` — działa w każdej wersji expo-router.
- **Klucze React Query — dwa różne zastosowania.** W `useQuery` używaj pełnego klucza leaf: `QUERY_KEYS.vehicles.all` = `['vehicles', 'all']`. W `invalidateQueries` używaj prefiksu: `{ queryKey: ['vehicles'] }` — to unieważni WSZYSTKIE zapytania zaczynające się od `'vehicles'` (bulk invalidation). Nigdy nie używaj `QUERY_KEYS.vehicles.all` w `invalidateQueries` jeśli chcesz invalidować też przyszłe sub-zasoby.
- **MSW init = `require('./native')` WEWNĄTRZ `initMsw()`, nie na poziomie modułu.** `rettime` (dep MSW 2.x) wykonuje kod statyczny przy ładowaniu modułu i odwołuje się do `MessageEvent`, który nie istnieje w Hermes gdy MSW jest wyłączony. Wzorzec: `if (process.env.EXPO_PUBLIC_API_MOCK !== 'true') return; const { server } = require('./native');` — `require` wewnątrz warunku gwarantuje, że `msw/native` nie jest ładowany gdy MSW jest wyłączony. `require()` (synchroniczny) zamiast `await import()` — Metro bundluje synchronicznie, dynamic import powoduje race condition.
- **isError w hookach danych.** Każdy ekran który używa `useQuery` musi obsługiwać trzy stany w kolejności: `isError` PIERWSZE (EmptyState), `isLoading || !data` (Spinner), dane (render). Odwrócona kolejność (`isLoading` przed `isError`) powoduje wieczny spinner gdy `data=undefined` po błędzie.
- **Error boundary = `error.tsx`, nie `+error.tsx` ani `_error.tsx`.** expo-router v3.5+ rejestruje globalne error boundary jako `app/error.tsx`. Plik `+error.tsx` jest odrzucany przez router z błędem "Route nodes cannot start with the '+' character". Plik `_error.tsx` jest traktowany jako prywatny i ignorowany.
- **Nowe sub-trasy pod Tabs = wpis w `_layout.tsx`.** Każdy nowy ekran zagnieżdżony pod `providers/[id]/...` lub `bookings/[id]/...` wymaga jawnego `<Tabs.Screen name="providers/[id]/nowy-ekran" options={{ href: null }} />` w `app/(app)/_layout.tsx`. Brak wpisu = trasa może nie działać w runtime.
- **NetInfo i natywne listenery = `useEffect`, nie poziom modułu.** `NetInfo.addEventListener` (i podobne) wywołane na poziomie modułu (poza komponentem) rzuca `java.lang.String cannot be cast to java.lang.Boolean` w New Architecture (JSI strict type checking). Efekt: crash modułu → „Route \_layout.tsx missing default export". Zawsze rejestruj natywne listenery wewnątrz `useEffect` z cleanup: `return setupOnlineManager()`.
- **`react-native-screens` = `~4.16.0` dla Expo Go SDK 54.** Wersje 4.17.0–4.24.x zmieniły format przekazywania propsów boolean do natywnego view managera. Expo Go SDK 54 ma skompilowany natywnie moduł z ~4.16.0 — użycie 4.17.0+ JS powoduje `java.lang.String cannot be cast to java.lang.Boolean` w Fabric (`setProperty → updateProperties → createViewInstance`). Fix: `"react-native-screens": "~4.16.0"` w `apps/mobile/package.json` ORAZ w `pnpm.overrides` w root `package.json`. **Nie dotyczy EAS Build** — tam kompilujesz swój własny natywny kod, więc wersje JS i native są zawsze zsynchronizowane.
- **Offline mutations = `assertOnline()` w `mutationFn`.** Każda mutacja zmieniająca stan serwera musi sprawdzić połączenie: `const state = await NetInfo.fetch(); if (!state.isConnected) throw new Error('Brak połączenia z internetem')`. Sam `OfflineBanner` wystarczy do wyświetlenia banera — nie blokuje requestów.

## Najważniejsze zasady — Backend mobile (`apps/api`, kontrolery `/v1/app/...`)

- **`@Roles(UserRole.CLIENT)` i `@ApiBearerAuth()` na klasie, nie na metodzie.** Każda klasa kontrolera mapowana na `/v1/app/...` musi mieć oba dekoratory na poziomie klasy. Brak `@Roles` na klasie → globalny `RolesGuard` przepuszcza dowolnie uwierzytelnioną rolę.
- **Mobilny endpoint = moduł swojej domeny.** `POST /v1/app/users/me/consent` → `UsersAppModule`, `/v1/app/bookings/...` → `BookingsModule`, itd. Nigdy nie umieszczaj mobilnego endpointu w module innej domeny (np. `consent` w `AuthModule`) — powoduje duplikaty ścieżek i brak `@Roles`.
- **`ParseUUIDPipe` na każdym parametrze `:id`.** `@Param('id', ParseUUIDPipe) id: string` — bez tego nieprawidłowe UUID trafia do Prisma zamiast zwrócić 400.
- **`forwardRef()` przy circular deps między modułami mobilnymi.** Gdy moduł A importuje moduł B i B importuje A — użyj `forwardRef(() => B)` w obu. Dotyczy trójek: `ProvidersModule ↔ BookingsModule ↔ ReviewsModule`. Brak `forwardRef` = crash przy starcie serwera (`Cannot access before initialization`).

## Commit workflow

Nie commituj automatycznie. Czekaj na sygnał od usera.
