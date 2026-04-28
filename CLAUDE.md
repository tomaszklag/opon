# CLAUDE.md — Opony.app

Pełna dokumentacja developerska: **`docs/developer-guide.md`**. Przeczytaj go przed implementacją.

## Najważniejsze zasady (skrót)

- **Tekst = DS komponent.** `<Heading>` lub `<Text>` z `@opony/design-system-web`. Nigdy `font-size/font-weight/line-height/letter-spacing/font-family/color` w CSS module dla elementów tekstowych — zamiast tego użyj propsów `variant`, `weight`, `color`, `mono`.
- **Komponenty UI = DS.** `Input`, `Button`, `Select`, `Spinner` itd. — nigdy natywne HTML jako obejście.
- **Ikony = `apps/panel/components/icons.tsx`.** Nigdy inline SVG.
- **Tokeny = `global.css`.** Jedyne źródło prawdy dla kolorów, spacing, typografii.
- **Typy API = `components['schemas']['XxxResponseDto']`.** Nigdy ręczna definicja.
- **Routing = `canonicalRoute()`.** Nigdy własny `router.replace` z logiką statusów.
- **Klucze API tylko w `apps/api/.env`.** Nigdy w `NEXT_PUBLIC_*` ani w kodzie.

## Commit workflow

Nie commituj automatycznie. Czekaj na sygnał od usera.
