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
- **Typy API = `components['schemas']['XxxDto']`.** Gdy endpoint `/v1/app/...` jeszcze nie istnieje w `schema.d.ts` (bo kontroler mobilny nie jest zaimplementowany), stwórz tymczasowy `interface` z komentarzem `// TODO: replace with components['schemas']['AppXxxResponseDto'] after BE implementation`. Nie zostawiaj ręcznych typów bez tego komentarza.
- **Toast = `useToast()`.** `import { useToast } from '@opony/design-system-native'` — nigdy z innej biblioteki.
- **Auth guard (expo-router v3) = `useSegments + useEffect`.** `Stack.Protected` nie istnieje w expo-router v3 — używaj wzorca `AuthGuard` komponentu jak w `app/_layout.tsx`.
- **Klucze React Query — dwa różne zastosowania.** W `useQuery` używaj pełnego klucza leaf: `QUERY_KEYS.vehicles.all` = `['vehicles', 'all']`. W `invalidateQueries` używaj prefiksu: `{ queryKey: ['vehicles'] }` — to unieważni WSZYSTKIE zapytania zaczynające się od `'vehicles'` (bulk invalidation). Nigdy nie używaj `QUERY_KEYS.vehicles.all` w `invalidateQueries` jeśli chcesz invalidować też przyszłe sub-zasoby.
- **MSW init = synchroniczny `require()`.** W `mocks/index.ts` używaj `require('./native')` zamiast `await import('./native')`. Metro bundler rozwiązuje `require()` synchronicznie — gwarantuje to, że MSW jest gotowy przed pierwszym requestem. Async dynamic import powoduje race condition na cold start.
- **isError w hookach danych.** Każdy ekran który używa `useQuery` musi obsługiwać trzy stany w kolejności: `isError` PIERWSZE (EmptyState), `isLoading || !data` (Spinner), dane (render). Odwrócona kolejność (`isLoading` przed `isError`) powoduje wieczny spinner gdy `data=undefined` po błędzie.
- **Error boundary = `+error.tsx`, nie `_error.tsx`.** expo-router v3 rejestruje globalne error boundary jako `app/+error.tsx`. Plik `_error.tsx` (z podkreślnikiem) jest traktowany jako prywatny i ignorowany przez router.
- **Nowe sub-trasy pod Tabs = wpis w `_layout.tsx`.** Każdy nowy ekran zagnieżdżony pod `providers/[id]/...` lub `bookings/[id]/...` wymaga jawnego `<Tabs.Screen name="providers/[id]/nowy-ekran" options={{ href: null }} />` w `app/(app)/_layout.tsx`. Brak wpisu = trasa może nie działać w runtime.

## Commit workflow

Nie commituj automatycznie. Czekaj na sygnał od usera.
