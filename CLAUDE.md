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
- **Kolory = tokeny.** `t.colors.xxx` — nigdy inline `rgba(...)` ani hex. Jeśli kolor z przezroczystością nie istnieje w tokenach, zgłoś potrzebę dodania go do `@opony/design-tokens`.
- **Typy API = `components['schemas']['XxxDto']`.** Gdy endpoint `/v1/app/...` jeszcze nie istnieje w `schema.d.ts` (bo kontroler mobilny nie jest zaimplementowany), stwórz tymczasowy `interface` z komentarzem `// TODO: replace with components['schemas']['AppXxxResponseDto'] after BE implementation`. Nie zostawiaj ręcznych typów bez tego komentarza.
- **Toast = `useToast()`.** `import { useToast } from '@opony/design-system-native'` — nigdy z innej biblioteki.
- **Auth guard (expo-router v3) = `useSegments + useEffect`.** `Stack.Protected` nie istnieje w expo-router v3 — używaj wzorca `AuthGuard` komponentu jak w `app/_layout.tsx`.
- **Klucze React Query = hierarchiczne tablice.** Każdy klucz musi być tablicą z co najmniej dwoma elementami: `['zasób', 'all']`, `['zasób', 'detail', id]`. Nigdy `['zasób']` jako klucz leaf — uniemożliwia to selektywną invalidację.

## Commit workflow

Nie commituj automatycznie. Czekaj na sygnał od usera.
