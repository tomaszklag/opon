# Developer Guide — Opony.app

> Praktyczne instrukcje dla agentów i developerów pracujących w tym repo. Setup środowiska jest w `architektura.md §4`. Ten dokument obejmuje codzienne workflow: Prisma, API types, branche, nowe moduły.

---

## 1. Uruchamianie środowiska

```bash
# Baza danych + Mailpit (wymagane przed dev)
pnpm docker:up

# Wszystkie aplikacje równolegle (turbo)
pnpm dev
```

| Serwis          | URL                             |
| --------------- | ------------------------------- |
| Provider panel  | `http://localhost:3001`         |
| Client PWA      | `http://localhost:3000`         |
| Landing         | `http://localhost:3002`         |
| API + Swagger   | `http://localhost:4000/v1/docs` |
| Mailpit (email) | `http://localhost:8025`         |

**Zatrzymanie wszystkich procesów dev (Windows):**

```powershell
pnpm dev-stop
# lub ręcznie:
powershell -ExecutionPolicy Bypass -File scripts/dev-stop.ps1
```

Skrypt `scripts/dev-stop.ps1` zabija procesy na portach 4000, 3001, 3002, 19006.

---

## 2. Baza danych — Prisma

### 2.1. Schemat i modele

Schemat Prisma: `apps/api/prisma/schema.prisma`

Zasady nazewnictwa:

- **Model** → PascalCase, liczba pojedyncza: `Provider`, `Booking`, `WorkingHours`
- **Pole** → camelCase: `ownerId`, `createdAt`, `serviceRadiusKm`
- **Enum** → PascalCase nazwa, UPPER_SNAKE_CASE wartości: `ProviderStatus { PENDING_NIP APPROVED … }`
- **Tabela** → snake_case (mapowana przez `@@map`): `@@map("providers")`
- **FK** → `providerId` (camelCase) odwołuje się do `Provider.id`

### 2.2. Dodawanie nowego modelu — krok po kroku

```
1. Edytuj apps/api/prisma/schema.prisma
2. pnpm db:migrate          ← tworzy i aplikuje migration SQL
3. (opcjonalnie) pnpm db:seed  ← jeśli seed wymaga nowych danych
```

```bash
# Przykład: tworzenie migracji z nazwą
cd apps/api && pnpm prisma migrate dev --name add_reviews_table
```

**Ważne:**

- Jedna migracja per sprint — nie miksuj zmian schematu z różnych modułów
- Nie edytuj plików w `prisma/migrations/` ręcznie po ich wygenerowaniu
- Po migracji Prisma automatycznie regeneruje klienta (`@prisma/client`) — nie trzeba tego robić osobno
- Pole `Decimal` w Prisma serializuje się jako `number` w JSON — w DTO używaj `@ApiProperty({ type: Number })`

### 2.3. Komendy Prisma

```bash
pnpm db:migrate      # prisma migrate dev (development)
pnpm db:seed         # ts-node prisma/seed.ts
pnpm db:studio       # GUI do bazy — http://localhost:5555
```

Bezpośrednio:

```bash
cd apps/api
pnpm prisma migrate dev --name <nazwa>
pnpm prisma generate          # regeneruj klienta bez migracji
pnpm prisma migrate reset     # ⚠ resetuje bazę i aplikuje od nowa (dev only)
pnpm prisma studio
```

---

## 3. Typy API — generowanie i utrzymanie

Pełna specyfikacja: `architektura.md §9.A`. Poniżej skrócony cheatsheet.

### 3.1. Regeneracja schematu (po zmianach w BE)

```bash
# 1. Upewnij się że API działa
pnpm --filter api dev   # lub pnpm dev

# 2. Wygeneruj
pnpm generate:api-client
# generuje: packages/api-client/src/schema.d.ts
```

### 3.2. Wymagania dla agenta BE (nowy endpoint)

Każdy nowy endpoint **musi** mieć Response DTO i dekorator `@ApiResponse`:

```ts
// apps/api/src/<modul>/dto/<modul>-response.dto.ts
export class BookingResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) note?: string | null;
  @ApiProperty({ type: Number }) totalPricePln!: number;
  @ApiProperty({ enum: BookingStatus }) status!: BookingStatus;
  @ApiProperty() createdAt!: Date;
}

// apps/api/src/<modul>/<modul>.controller.ts
@ApiResponse({ status: 200, type: BookingResponseDto })
getBooking() { ... }

@ApiResponse({ status: 200, type: [BookingResponseDto] })  // tablica
listBookings() { ... }

@ApiResponse({ status: 201, type: BookingResponseDto })
createBooking() { ... }
```

### 3.3. Wymagania dla agenta FE (nowa strona)

```ts
// apps/panel/api-data-access/bookings.ts
import type { components } from '@opony/api-client';

export type Booking = components['schemas']['BookingResponseDto']; // ← alias, nie ręczna definicja
export type CreateBookingBody = components['schemas']['CreateBookingDto'];

export function getBookings(): Promise<Booking[]> {
  return api.get<Booking[]>('/v1/providers/me/bookings');
}
```

Nigdy nie definiuj typów odpowiedzi ręcznie — zawsze `components['schemas']['XxxResponseDto']`.

---

## 4. Workflow branchy i commitów

### 4.1. Nazewnictwo branchy

```
sprint-<numer>/<agent>-<krótki-opis>

Przykłady:
  sprint-1/be-auth-otp
  sprint-2/fe-panel-cennik
  sprint-3/be-booking-state-machine
```

Gałąź główna: `main`. Feature branches mergowane przez PR, nie bezpośrednio.

### 4.2. Konwencja commitów

Format: `<typ>: <krótki opis po polsku lub angielsku>`

| Typ        | Kiedy używać                      |
| ---------- | --------------------------------- |
| `feat`     | Nowa funkcjonalność               |
| `fix`      | Naprawa buga                      |
| `refactor` | Refactoring bez zmiany zachowania |
| `docs`     | Zmiany w dokumentacji             |
| `test`     | Dodanie/poprawienie testów        |
| `chore`    | Konfiguracja, zależności, tooling |

```bash
# Przykłady
git commit -m "feat: dodaj endpoint POST /v1/bookings z state machine"
git commit -m "fix: popraw nullable phone w ProviderResponseDto"
git commit -m "docs: dodaj §9.A kontrakt typów API"
```

Husky + lint-staged uruchamia ESLint i Prettier automatycznie przed każdym commitem.

---

## 5. Dodawanie nowego modułu BE — krok po kroku

```
1. Schemat Prisma
   └─ apps/api/prisma/schema.prisma  ← dodaj model
   └─ pnpm db:migrate --name add_<modul>

2. Moduł NestJS
   └─ apps/api/src/<modul>/
        ├─ <modul>.module.ts
        ├─ <modul>.controller.ts
        ├─ <modul>.service.ts
        ├─ <modul>.repository.ts   (opcjonalnie)
        └─ dto/
             ├─ create-<modul>.dto.ts      ← @IsString, @IsNumber itd.
             ├─ update-<modul>.dto.ts
             └─ <modul>-response.dto.ts    ← @ApiProperty + @ApiResponse (OBOWIĄZKOWE)

3. Zarejestruj w module nadrzędnym (AppModule lub ProvidersModule)

4. Swagger
   └─ @ApiTags, @ApiCookieAuth, @ApiOperation na kontrolerze
   └─ @ApiResponse({ type: XxxResponseDto }) na każdej metodzie

5. Testy
   └─ apps/api/src/<modul>/<modul>.service.spec.ts  ← min. 3–5 testów
   └─ pnpm --filter api test

6. Zregeneruj typy dla FE
   └─ pnpm generate:api-client

7. Sprawdź TypeScript
   └─ cd apps/api && npx tsc --noEmit
```

---

## 6. Dodawanie nowej strony FE (panel) — krok po kroku

```
1. api-data-access (jeśli nowy kontroler)
   └─ apps/panel/api-data-access/<modul>.ts
        export type Xxx = components['schemas']['XxxResponseDto'];
        export function getXxx(): Promise<Xxx> { ... }

2. Hook stanu / formularza
   └─ apps/panel/lib/hooks/use-<modul>.ts  ← cała logika, zero JSX
        export function useMyFeature() { ... }

3. Komponenty strony
   └─ apps/panel/app/dashboard/<modul>/_components/utils.ts     ← stałe + helpery
   └─ apps/panel/app/dashboard/<modul>/_components/MyActionBar.tsx
   └─ apps/panel/app/dashboard/<modul>/_components/MySection.tsx
   └─ apps/panel/app/dashboard/<modul>/_components/<inne>.tsx

4. Strona Next.js (~50 linii — tylko orchestracja)
   └─ apps/panel/app/dashboard/<modul>/page.tsx
   └─ apps/panel/app/dashboard/<modul>/<modul>.module.css

5. Zweryfikuj TypeScript
   └─ pnpm --filter panel exec tsc --noEmit
```

**Nazewnictwo identyfikatorów — zawsze angielski:**

Wszystkie nazwy w kodzie muszą być po angielsku: klasy CSS (`photoTile`, `savingStrip`), zmienne/funkcje/interfejsy TypeScript, nazwy plików (`use-photos-flow.ts`, `photos.module.css`). Wyjątek: segmenty URL (`/onboarding/zdjecia`) — to publiczne adresy, nie identyfikatory kodu.

**Obowiązkowy podział:**

- `page.tsx` importuje **jeden hook** i **N komponentów** — żadnej logiki, żadnych helperów inline, żadnych inline SVG
- Komponenty specyficzne dla strony idą do `_components/` (podkreślnik → Next.js nie traktuje jako route)
- Stałe i czyste funkcje (np. `DAY_META`, `parseTime`) do `_components/utils.ts`
- Komponenty wielokrotnego użytku (np. `Spinner`, `Badge`) do `apps/panel/components/`

**Przed napisaniem nowego komponentu:**

1. Sprawdź `packages/design-system-web/src/` czy odpowiednik już istnieje
2. Jeśli istnieje ale wygląda inaczej niż design — popraw DS, nie twórz lokalnej kopii
3. Jeśli brakuje w DS i będzie używany w ≥2 miejscach — dodaj do DS
4. Ikony SVG zawsze przez `apps/panel/components/icons.tsx`, nigdy inline

Pełna specyfikacja wzorca: `architektura.md §9.C`.

Design reference dla każdego ekranu panelu: `design/b2b-*.html`. Mapa ekran ↔ task w `plan-sprintow.md §12.Z`.

---

## 7. Komponenty UI — zawsze z Design System

Każdy element UI w `apps/panel` musi używać komponentów z `@opony/design-system-web` — zarówno interaktywne formy, jak i **tekst**.

### Typografia — Heading i Text

Każdy tekst w JSX musi używać `<Heading>` lub `<Text>`. **Nigdy** nie definiuj `font-size`, `font-weight`, `line-height`, `letter-spacing`, `font-family` w plikach CSS module — to wyłączna odpowiedzialność DS.

```tsx
import { Heading, Text } from '@opony/design-system-web';

// ✅ TAK
<Heading variant="section">Tytuł sekcji</Heading>
<Text variant="body-sm" as="span" weight="bold">Label</Text>

// ❌ NIE
<h2 className={styles.title}>Tytuł</h2>    // jeśli .title definiuje font-*
<span style={{ fontSize: '12px' }}>Label</span>
```

#### Heading — warianty

| Wariant      | Zastosowanie                                  |
| ------------ | --------------------------------------------- |
| `hero-xl`    | Największy nagłówek strony (62px Bebas Neue)  |
| `hero`       | Hero sekcje (48px Bebas Neue)                 |
| `display-xl` | Duże liczby, statystyki (42px Bebas Neue)     |
| `display`    | Wyróżnione nagłówki ekranów (32px Bebas Neue) |
| `section`    | Nagłówek sekcji — domyślny (24px Bebas Neue)  |
| `subsection` | Podsekcja (18px Bebas Neue)                   |

`as` akceptuje: `h1 h2 h3 h4 h5 h6 span div`

#### Text — warianty

| Wariant     | Zastosowanie                                    |
| ----------- | ----------------------------------------------- |
| `body`      | Tekst podstawowy (15px Archivo)                 |
| `body-md`   | Powiększony body (17px)                         |
| `body-sm`   | Mniejszy body, opisy (13px)                     |
| `caption`   | Podpisy, muted (13px, auto-muted color)         |
| `label`     | Uppercase tag, badge (10px extrabold)           |
| `nano`      | Bardzo mały tag/badge (9px extrabold uppercase) |
| `kicker`    | Mono wartości techniczne (13px JetBrains Mono)  |
| `kicker-sm` | Mono mikro — rozmiary pliku, kody (9px Mono)    |

`as` akceptuje: `p span div label li strong em`

#### CSS Modules + noUncheckedIndexedAccess

`tsconfig.base.json` ma `noUncheckedIndexedAccess: true` — `styles.foo` zwraca `string | undefined`. Przy budowaniu map wariantów w komponentach DS wymagany cast:

```ts
const variantClass: Record<Variant, string> = {
  hero: styles.hero as string, // wymagane — bez cast błąd TS
};
```

---

Każdy interaktywny element w `apps/panel` musi używać komponentu z `@opony/design-system-web`. Design w `design/b2b-*.html` (sekcja „DS Components") wskazuje jakich komponentów użyć na danej stronie.

```ts
import {
  Input,
  PhoneInput,
  OTPInput,
  Button,
  Toggle,
  Select,
  Textarea,
  Spinner,
} from '@opony/design-system-web';
```

### Zasada: sprawdź DS zanim stworzysz własny komponent

**Zanim napiszesz nowy komponent** — sprawdź `packages/design-system-web/src/`. Jeśli odpowiednik istnieje ale wizualnie nie zgadza się z designem → **napraw DS**, nie twórz lokalnego duplikatu. Lokalne kopie komponentów DS są niedopuszczalne.

Przykład: `StepIndicator` w DS istniał, ale miał błędny styl (full-width `<ol>` zamiast kompaktowego paska). Właściwe rozwiązanie: zaktualizować DS, nie tworzyć `StepsIndicator.tsx` w panelu.

### Najczęstsze zamienniki

| Zamiast                                       | Użyj                                                 |
| --------------------------------------------- | ---------------------------------------------------- |
| `<input type="text" />`                       | `<Input label="..." error={...} />`                  |
| `<input type="tel" />`                        | `<PhoneInput label="..." />`                         |
| `<textarea />`                                | `<Textarea label="..." maxLength={N} />`             |
| `<select><option>...</option></select>`       | `<Select options={[{value,label}]} />`               |
| `<button className={styles.saveBtn}>`         | `<Button variant="primary" loading={saving}>`        |
| `<button role="switch">` (toggle)             | `<Toggle checked={val} onChange={...} />`            |
| Siatka 6× `<input maxLength={1}>` dla OTP     | `<OTPInput length={6} value={v} onChange={f}>`       |
| `<p className={styles.error}>{msg}</p>`       | `<NoticeBlock variant="danger">{msg}</NoticeBlock>`  |
| `<div className={styles.warning}>{msg}</div>` | `<NoticeBlock variant="warning">{msg}</NoticeBlock>` |
| Własny wizard/stepper                         | `<StepIndicator steps={[{label, status}]} />`        |
| `<label className={styles.label}>...</label>` | `<FieldLabel htmlFor="id" required>...</FieldLabel>` |

DS `Input` i `Textarea` są `forwardRef` → działają bezpośrednio z `{...register('field')}` z RHF.

### DS Button — warianty i rozmiary

Wariant określa **wyłącznie schemat kolorów**. Rozmiar określa **wyłącznie wymiary**. Nigdy nie umieszczaj `height`, `padding` ani `font-size` w wariancie — i odwrotnie, nie umieszczaj kolorów w rozmiarze.

#### Warianty

| Wariant     | Kiedy używać                                                        |
| ----------- | ------------------------------------------------------------------- |
| `primary`   | Główna akcja strony (submit, Dalej, Zapisz). Zawsze tylko jeden.    |
| `secondary` | Akcja alternatywna z akcentem — np. „Dodaj kolejny".                |
| `neutral`   | Nawigacja wstecz, Anuluj — przezroczysty, obramowanie `--border`.   |
| `ghost`     | Akcja w toolbarze/nagłówku — przezroczysty, bez obramowania.        |
| `danger`    | Destruktywne operacje (Usuń konto, Odrzuć).                         |
| `link`      | Inline link-button — bez obramowania, kolor akcentu.                |
| `cta`       | Jednorazowe hero-CTA na stronach auth (Bebas Neue, persistent glow) |

#### Rozmiary

| Rozmiar | Wysokość | Użycie                                    |
| ------- | -------- | ----------------------------------------- |
| `sm`    | 32 px    | Gęste UI — wiersze tabeli, toolbar.       |
| `md`    | 44 px    | Domyślny — formularze, dialogi (default). |
| `lg`    | 52 px    | Duże akcenty — główne CTA sekcji.         |

Jeśli design pokazuje przycisk o wymiarach, które nie pasują do żadnego rozmiaru DS → design jest niespójny z DS. Używaj najbliższego rozmiaru DS, nie nadpisuj w page CSS.

#### Reguła: żadnych `!important` w page CSS dla DS Button

Jeśli DS Button wygląda inaczej niż design, właściwe rozwiązanie to:

1. Dodaj nowy **wariant** (kolor/border) do `Button.module.css` i `ButtonVariant`
2. Dodaj nowy **token** do `global.css` (shadow, kolor)
3. Zaktualizuj istniejący wariant w DS

**Nigdy** nie nadpisuj `height`, `padding`, `border-radius` ani `font-size` z `!important` w pliku `*.module.css` strony. To sygnał, że brakuje wariantu lub rozmiaru w DS.

```css
/* ✅ TAK — brakuje wariantu, dodaj do DS */
/* packages/design-system-web/src/forms/Button/Button.module.css */
.neutral {
  background: transparent;
  color: var(--text-primary);
  border-color: var(--border);
}

/* ❌ NIE — walczenie z DS przez !important w page CSS */
.myBackBtn {
  height: auto !important;
  border-color: var(--border) !important;
  color: var(--text-primary) !important;
}
```

### Reguła: tło inputów zawsze `var(--bg)`

Wszystkie komponenty formularzy DS (`Input`, `Textarea`, `Select`, `PhoneInput`) używają `background: var(--bg)` — nie `var(--surface)` ani `var(--surface-raised)`. Tło `--surface-raised` jest zarezerwowane dla elementów unoszących się nad stroną (dropdowny, modale).

### Reguła: stany złożone wymagają jawnej reguły CSS

Jeśli element ma jednocześnie stan bazowy, hover i aktywny/zaznaczony, musisz zdefiniować **wszystkie kombinacje**:

```css
/* ✅ TAK — hover na zaznaczonym elemencie widoczny */
.row {
  background: var(--bg);
}
.row:hover {
  background: var(--surface-hover);
}
.rowChecked {
  background: rgba(255, 107, 26, 0.06);
  border-color: var(--accent-border);
}
.rowChecked:hover {
  background: var(--accent-muted);
  border-color: var(--accent-border);
}

/* ❌ NIE — hover nadpisuje stan checked, użytkownik nie widzi zaznaczenia */
.row:hover {
  background: var(--surface-hover);
} /* niszczy .rowChecked podczas hover */
```

Dotyczy to checkboxów, kart konsentów, wierszy tabeli z selekcją — wszędzie gdzie hover i selected mogą współistnieć.

Jeśli brakuje komponentu w DS lub nie obsługuje wymaganego stanu → **dodaj/popraw w `packages/design-system-web/`**, nie używaj natywnego HTML jako obejścia.

### Tokeny CSS — jeden źródłowy plik

Wszystkie tokeny (kolory, spacing, radius, typography) są w:

```
packages/design-system-web/src/global.css   ← jedyne źródło prawdy
```

Plik `apps/panel/app/layout.tsx` importuje go jako pierwszy (`import '@opony/design-system-web/global.css'`).
`panel.css` zawiera tylko: reset, link styles, font: inherit, utility classes, aliasy backward-compatible.

**Nigdy nie redefiniuj tokenów w `panel.css`** — zmiany tokenów rób w `global.css`.

| ✅ TAK                            | ❌ NIE                                     |
| --------------------------------- | ------------------------------------------ |
| Zmiana `--accent` w `global.css`  | `--accent: #xxx` w `panel.css` lub module  |
| Nowy token dodany do `global.css` | Token zdefiniowany tylko w module.css      |
| `var(--surface)` w CSS            | `var(--bg-surface)` — stara nazwa panelowa |
| `var(--text-primary)` w CSS       | `var(--text)` — stara nazwa panelowa       |

### Reguła: żadnych hardcoded wartości kolorów w CSS module

W plikach `*.module.css` **nie wolno** używać wartości hex ani rgba gdy istnieje odpowiedni token DS.

```css
/* ✅ TAK */
background: var(--accent-muted);
border: 1px solid var(--accent-border);
box-shadow: 0 0 10px var(--accent-glow);
background: var(--success-muted);
border-color: var(--danger-border);

/* ❌ NIE */
background: rgba(255, 107, 26, 0.14); /* to jest --accent-muted */
border: 1px solid rgba(255, 107, 26, 0.32); /* to jest --accent-border */
box-shadow: 0 0 10px rgba(255, 107, 26, 0.45); /* to jest --accent-glow */
```

Dostępne tokeny kolorów w `global.css`:

```
--accent, --accent-hover, --accent-dark
--accent-muted      rgba(255,107,26, 0.14)
--accent-border     rgba(255,107,26, 0.32)
--accent-glow       rgba(255,107,26, 0.45)
--success, --success-muted, --success-border
--warning, --warning-muted, --warning-border
--danger, --danger-muted, --danger-border

/* shadows */
--shadow-sm / --shadow-md / --shadow-lg   ← cienie neutralne (czarne)
--shadow-accent                           ← glow (0 0 20px accent-glow) — używany na hover
--shadow-accent-lift                      ← elevation + kolor (0 8px 20px rgba(255,107,26,0.35))
                                            wbudowany w Button variant="primary" (base state)
```

Wartości bez tokenu (np. specyficzne przezroczystości w gradientach tła) mogą pozostać hardcoded — ale to wyjątek, nie reguła.

---

## 8. Dodawanie nowej ikony SVG

Wszystkie ikony SVG są w jednym pliku: `apps/panel/components/icons.tsx`.

**Nie wolno** umieszczać inline SVG w stronach ani komponentach.

### Jak dodać nową ikonę

```ts
// apps/panel/components/icons.tsx
export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}           // ← zawsze na końcu, umożliwia override width/height/className
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
```

### Jak użyć w komponencie

```tsx
import { IconCalendar } from '../../../components/icons';

// rozmiar przez props
<IconCalendar width="16" height="16" />

// rozmiar przez CSS class
<IconCalendar className={styles.icon} />
```

**Checklist nowej ikony:**

- [ ] Dodana do `apps/panel/components/icons.tsx` jako named export
- [ ] `{...props}` na końcu atrybutów SVG
- [ ] `aria-hidden="true"` obecne
- [ ] Brak hardcoded `width`/`height` w definicji (tylko przez props)

---

## 9. Auth & Sesja

### 9.1. Model sesji

JWT access token (15 min) + refresh token (30 dni) przechowywane w httpOnly cookie. Frontend nie widzi tokenów — cookie jest wysyłane automatycznie przez przeglądarkę (`credentials: 'include'` w każdym `fetch`).

Po 30 dniach bez aktywności backend unieważnia refresh token → następny request zwróci 401 → użytkownik trafia na stronę logowania.

### 9.2. Auto-refresh interceptor (`lib/api.ts`)

`api.ts` automatycznie obsługuje wygasły access token:

1. Request → 401 → wywołaj `POST /v1/auth/refresh`
2. Refresh OK → ponów oryginalny request (jeden raz)
3. Refresh 401 → rzuć oryginalny błąd (wylogowanie obsługuje `AuthProvider`)

Mechanizm jest wbudowany w `request()` — **nie dodawaj własnej obsługi 401 w hookach**. Jeśli po całym flow dostajesz 401, znaczy że refresh token wygasł i użytkownik powinien się zalogować.

Równoległe requesty z 401 są koalescowane — wywołanie refresh wykonuje się tylko raz.

**FormData (upload pliku):** `api.ts` automatycznie wykrywa ciało typu `FormData` i pomija `Content-Type: application/json` oraz `JSON.stringify`. Wystarczy przekazać `FormData` jako `body`:

```ts
const formData = new FormData();
formData.append('file', file);
formData.append('type', type);
await api.post<ProviderPhoto>(PHOTOS_KEY, formData); // ← działa out-of-the-box
```

Nie twórz własnych wrapperów `fetchWithRefresh` ani nie ustawiaj `Content-Type: multipart/form-data` ręcznie — przeglądarka musi sama ustawić boundary.

### 9.3. Reguły routingu — `canonicalRoute`

Jedyne źródło prawdy dla decyzji o przekierowaniu to funkcja w `lib/auth-routing.ts`:

```ts
canonicalRoute(user: AuthUser | null): '/login' | '/register' | '/onboarding/zdjecia' | '/onboarding/weryfikacja' | '/dashboard'
```

| `user`  | `providerId` | `status`                                        | Wynik                     |
| ------- | ------------ | ----------------------------------------------- | ------------------------- |
| `null`  | —            | —                                               | `/login`                  |
| present | brak         | —                                               | `/register`               |
| present | present      | `PENDING_DOCS` lub `PENDING_NIP`                | `/onboarding/zdjecia`     |
| present | present      | ≠ `APPROVED`, ≠ `PENDING_DOCS`, ≠ `PENDING_NIP` | `/onboarding/weryfikacja` |
| present | present      | `APPROVED`                                      | `/dashboard`              |

**Nigdy nie implementuj logiki przekierowań ręcznie.** Zawsze używaj `canonicalRoute`.

Możliwe wartości `status` (`ProviderStatus`):

| Wartość            | Znaczenie                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| `PENDING_NIP`      | Onboarding niezakończony — traktowany jak `PENDING_DOCS` w routingu (oba → `/onboarding/zdjecia`) |
| `PENDING_DOCS`     | Onboarding niezakończony — brak dokumentów                                                        |
| `PENDING_APPROVAL` | Czeka na ręczną weryfikację przez admina                                                          |
| `APPROVED`         | Aktywny — dostęp do dashboardu                                                                    |
| `SUSPENDED`        | Zawieszony przez admina                                                                           |
| `REJECTED`         | Odrzucony — nie może korzystać z panelu                                                           |

Typ w kodzie: `AuthUser.status?: ProviderStatus` z `lib/auth.tsx`.

### 9.4. Guardy — dwie warstwy

Ochrona tras działa na dwóch poziomach:

**Warstwa 1 — Middleware (`middleware.ts`, edge)**

Sprawdza samo istnienie cookie `access_token`. Brak cookie → natychmiastowy redirect do `/login` zanim React w ogóle się uruchomi. Chroni: `/dashboard/**`, `/register/**`, `/onboarding/**`.

Middleware **nie waliduje JWT** — tylko sprawdza obecność cookie. Faktyczna walidość tokenu jest weryfikowana przez backend przy każdym API request.

**Warstwa 2 — Hook (`lib/hooks/use-auth-guard.ts`, client)**

Obsługuje logikę biznesową po załadowaniu stanu auth. Każda chroniona strona wywołuje go na górze komponentu:

```ts
// Strona chroniona — zawsze tak, nigdy własny useEffect z router.replace
const { isLoading } = useAuthGuard('/dashboard');
if (isLoading) return <Spinner />;
```

Hook porównuje `canonicalRoute(user)` z przekazanym `pageRoute`. Jeśli się różnią → `router.replace(canonicalRoute(user))`.

**Strona logowania** używa `canonicalRoute` bezpośrednio w `useLoginFlow` — przekierowuje zalogowanego użytkownika do jego kanonicznego celu.

### 9.5. Rola = CLIENT

Jeśli `user.role === 'CLIENT'` po OTP — to numer klienta (z mobilnej aplikacji), nie providera. Nie rób redirect — pokaż `clientRoleError` (komunikat w OtpStep: „To numer klienta. Aby otworzyć panel, zarejestruj warsztat.").

---

## 10. Linting i formatowanie

```bash
pnpm lint            # ESLint na całym monorepo (auto-fix)
pnpm type-check      # tsc --noEmit na wszystkich aplikacjach
```

Husky uruchamia lint-staged automatycznie przy `git commit`:

- `**/*.{ts,tsx,js,jsx}` → `eslint --fix` + `prettier --write`
- `**/*.{json,md,yaml,yml}` → `prettier --write`

Jeśli commit się nie udaje przez hook — nie używaj `--no-verify`. Napraw problem i spróbuj ponownie.

---

## 11. Testowanie

```bash
pnpm test            # Vitest — unit + integration (wszystkie apps)
pnpm test:e2e        # Playwright — E2E (wymaga działającego dev env)

# Tylko jeden pakiet
pnpm --filter api test
pnpm --filter @opony/panel test
```

MSW mockuje API w testach FE i w dev (`NEXT_PUBLIC_API_MOCK=true`). Handlery: `apps/panel/mocks/handlers/`.

---

## 12. Przydatne one-linery

```bash
# Sprawdź czy wszystkie endpointy mają Response DTO w Swagger
curl -s http://localhost:4000/v1/docs-json | \
  node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); \
  const j=JSON.parse(d); \
  Object.entries(j.paths).forEach(([p,m])=>Object.entries(m).forEach(([method,op])=>{ \
  const r=op.responses; if(r?.['200']?.content==null && r?.['201']?.content==null) \
  console.log(method.toUpperCase(),p)}));"

# Prisma — podejrzyj aktualny stan bazy bez Studio
cd apps/api && pnpm prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname='public';"

# Sprawdź bundle size panelu
cd apps/panel && pnpm build && pnpm next build --debug 2>&1 | grep "First Load JS"
```

---

## 13. Formularze — walidacja i obsługa błędów

### Obowiązujący wzorzec: react-hook-form + Zod

Każdy formularz w `apps/panel` używa **react-hook-form** z **zodResolver** i schemą w `lib/schemas/`.

```
apps/panel/lib/schemas/
  provider.schema.ts   ← profil firmy
  register.schema.ts   ← rejestracja warsztatu
  pricing.schema.ts    ← nowy tier cennikowy
```

#### Struktura hooka

```typescript
// lib/hooks/use-foo-form.ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { fooSchema, type FooValues } from '../schemas/foo.schema';

export function useFooForm() {
  const form = useForm<FooValues>({
    resolver: zodResolver(fooSchema),
    defaultValues: { ... },
  });

  const [apiError, setApiError] = useState<string | null>(null);

  async function onSubmit(values: FooValues) {
    setApiError(null);
    try {
      await api.post('/v1/foo', values);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Błąd. Spróbuj ponownie.');
    }
  }

  return {
    form,
    apiError,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
```

#### Użycie w komponencie

```tsx
// Pole z automatyczną transformacją (np. digits-only) → Controller
<Controller
  name="nip"
  control={form.control}
  render={({ field, fieldState }) => (
    <Input
      value={field.value}
      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
      onBlur={field.onBlur}
      error={fieldState.error?.message}
    />
  )}
/>

// Proste pole tekstowe → register
<Input {...form.register('email')} error={form.formState.errors.email?.message} />

// Błąd API (po submit) → NoticeBlock z DS
{apiError && <NoticeBlock variant="danger">{apiError}</NoticeBlock>}
```

#### CTA — tylko `isSubmitting`, nigdy `!isValid`

Nie blokuj przycisku submit na podstawie `isValid`. Użytkownik, który kliknie i zobaczy błędy walidacji przy polach, dowie się co poprawić. Gdy CTA jest disabled, nie wie dlaczego i co zrobić.

```tsx
// ✅ TAK
const { formState: { isSubmitting } } = form;

<Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
  Dalej
</Button>

// ❌ NIE — użytkownik nie wie co musi wypełnić
<Button type="submit" disabled={!isValid}>
  Dalej
</Button>
```

RHF wywoła `onSubmit` dopiero gdy walidacja przejdzie — a przy niepowodzeniu `errors` zostaną ustawione i DS `Input` pokaże komunikaty przy każdym polu.

#### Programatyczne pola (setValue) — zawsze `shouldValidate: true`

Gdy pole jest kontrolowane przez `form.setValue` zamiast natywnego `onChange` (np. checkboxy custom, toggley, pola wypełniane automatycznie), dodaj `shouldValidate: true`. Bez tego RHF nie przelicza stanu walidacji i `errors` nigdy się nie pojawiają.

```typescript
// ✅ TAK
form.setValue('consentTerms', true, { shouldValidate: true });

// ❌ NIE — errors dla tego pola nigdy się nie pojawią po kliknięciu
form.setValue('consentTerms', true);

// ❌ NIE — shouldValidate: isSubmitted oznacza "tylko po pierwszym submit"
form.setValue('consentTerms', true, { shouldValidate: form.formState.isSubmitted });
```

#### `defaultValues` musi być ściśle zgodne ze schematem

Klucze w `defaultValues` muszą dokładnie odpowiadać polom Zod schematu — ani więcej, ani mniej. Dodatkowe klucze powodują błąd TS i mogą wprowadzać RHF w nieokreślony stan.

```typescript
// ✅ TAK — defaultValues pokrywa dokładnie pola schematu
const form = useForm<RegisterValues>({
  resolver: zodResolver(registerSchema),
  defaultValues: {
    nip: '',
    email: '',
    phone: '',
  },
});

// ❌ NIE — 'iban' nie istnieje w schemacie → błąd TS + bałagan w formState
defaultValues: {
  nip: '',
  email: '',
  phone: '',
  iban: '',   // pole usunięte ze schematu, nie usunięte z defaultValues
}
```

Przy zmianie schematu (dodanie/usunięcie pola) zawsze aktualizuj `defaultValues` w tym samym commicie.

#### Kiedy NIE używać react-hook-form

- **State machine z timerami** (`useLoginFlow`) — OTP flow, countdown, rate-limiting. Pojedyncza walidacja `digits.length !== 9` nie uzasadnia RHF.
- **Table editor z walidacją per-wiersz** (`useWorkingHours`) — 7 dni × kilka pól, walidacja czysto w `validate(): Record<dayOfWeek, string>`. `useFieldArray` byłoby tu nadmiarowe.

W tych przypadkach błąd po submit nadal trafia do `<NoticeBlock variant="danger">`, a błędy per-wiersz do `error` prop DS `Input`.

#### Schematy — zasady

- Jeden plik schema na domenę: `lib/schemas/<domena>.schema.ts`
- Eksportuj typ przez `z.infer<typeof schema>`: `export type FooValues = z.infer<typeof fooSchema>`
- Komunikaty błędów po polsku, konkretne: `'NIP musi mieć dokładnie 10 cyfr'` nie `'Wymagane'`
- Opcjonalne pola: `z.string().optional()` lub `z.string().max(n).optional()` — nie `z.string().nullable()`

---

## 14. Integracje z zewnętrznymi API

### 14.1. Gdzie trzymać klucze API

Klucze do zewnętrznych serwisów (CEIDG, Twilio, Resend, AWS) są wyłącznie w `apps/api/.env`. Ten plik jest w `.gitignore` — nigdy nie trafia do repozytorium.

```
# apps/api/.env  (gitignored, nigdy nie commituj)
GUS_API_KEY=eyJraWQiOiJjZWlkZy...

# .env.example  (commitowany, placeholder dla nowych devów)
GUS_API_KEY=placeholder
```

W CI/CD (GitHub Actions) klucze dodaje się jako **Secrets** w ustawieniach repozytorium — nie w kodzie ani w `.env.example`.

**Klucze nigdy nie mogą trafić do frontendu.** Zmienne `NEXT_PUBLIC_*` są widoczne w przeglądarce. Wszystkie wywołania do zewnętrznych API muszą przechodzić przez backend NestJS.

### 14.2. Wzorzec modułu NestJS dla zewnętrznego API

```
apps/api/src/<serwis>/
  <serwis>.module.ts      ← rejestruje kontroler i serwis
  <serwis>.controller.ts  ← endpoint, walidacja wejścia, @Public() jeśli pre-auth
  <serwis>.service.ts     ← logika wywołania, mapowanie odpowiedzi
```

Zarejestruj moduł w `AppModule`:

```typescript
// apps/api/src/app.module.ts
import { GusModule } from './gus/gus.module';

@Module({ imports: [..., GusModule] })
export class AppModule {}
```

### 14.3. Serwis — pobieranie klucza i wywołanie fetch

```typescript
@Injectable()
export class GusService {
  private readonly apiKey: string;

  constructor(config: ConfigService) {
    // getOrThrow — crash przy starcie jeśli zmienna nie istnieje, lepsze niż cichy undefined
    this.apiKey = config.getOrThrow<string>('GUS_API_KEY');
  }

  async lookupByNip(nip: string): Promise<GusResult> {
    let response: Response;
    try {
      response = await fetch(`https://external-api.example.com/endpoint?nip=${nip}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
    } catch {
      // błąd sieci (timeout, DNS) — nie ujawniaj szczegółów
      throw new InternalServerErrorException('Błąd połączenia z zewnętrznym serwisem.');
    }

    if (response.status === 404) throw new NotFoundException('Zasób nie znaleziony.');

    if (response.status === 400) {
      // parsuj kod błędu API i rzuć odpowiedni wyjątek NestJS
      const body = (await response.json().catch(() => ({}))) as { code?: string };
      if (body.code === 'NIEPOPRAWNY_NUMER_NIP') throw new NotFoundException('Nieprawidłowy NIP.');
      throw new InternalServerErrorException('Błąd zapytania do zewnętrznego API.');
    }

    if (!response.ok) throw new InternalServerErrorException(`Błąd API: ${response.status}`);

    const data = (await response.json()) as ExternalApiResponse;
    return this.mapResponse(data);
  }
}
```

`fetch` jest dostępny natywnie od Node 18 — `@types/node@18+` daje typy. Nie dodawaj `axios` ani `node-fetch`.

### 14.4. Endpoint pre-auth — dekorator @Public()

Endpointy wywoływane przed logowaniem (np. weryfikacja NIP podczas rejestracji) muszą być oznaczone `@Public()`, bo globalny `JwtAuthGuard` blokuje wszystkie trasy domyślnie:

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Get(':nip')
async getByNip(@Param('nip') nip: string) { ... }
```

### 14.5. Walidacja parametru przed wywołaniem API

Waliduj format parametru w kontrolerze zanim sięgniesz do zewnętrznego API — oszczędzasz request i zwracasz czytelny błąd:

```typescript
@Get(':nip')
async getByNip(@Param('nip') nip: string) {
  if (!/^\d{10}$/.test(nip)) {
    throw new BadRequestException('NIP musi mieć dokładnie 10 cyfr.');
  }
  return this.service.lookupByNip(nip);
}
```

---

## 15. Pobieranie danych w FE — SWR

Instalacja: `swr` jest już zależnością `apps/panel`. Nie instaluj `react-query` ani żadnej alternatywy.

### 15.1. Wzorzec hooka

```ts
// lib/hooks/use-photos-flow.ts
import useSWR from 'swr';
import { api } from '../api';

const PHOTOS_KEY = '/v1/providers/me/photos';

export function usePhotosFlow() {
  const { data: photos = [], error, isLoading, mutate } = useSWR<ProviderPhoto[]>(
    PHOTOS_KEY,
    (path) => api.get<ProviderPhoto[]>(path),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    },
  );
  ...
}
```

Klucz SWR (`PHOTOS_KEY`) to ścieżka API — SWR automatycznie deduplikuje requesty z tym samym kluczem w całej aplikacji.

### 15.2. Mutacje optymistyczne

Wzorzec: zmień lokalny cache natychmiast → wykonaj request → cofnij jeśli błąd.

```ts
// Operacja usuwania
const remove = useCallback(
  async (id: string) => {
    // 1. Optymistycznie usuń z cache
    await mutate((prev = []) => prev.filter((p) => p.id !== id), { revalidate: false });
    try {
      // 2. Faktyczny request
      await api.del(`${PHOTOS_KEY}/${id}`);
    } catch (err) {
      // 3. Błąd → cofnij (refetch z serwera)
      setError(err instanceof ApiError ? err.message : 'Błąd usuwania.');
      await mutate();
    }
  },
  [mutate],
);

// Operacja dodawania (POST zwraca nowy obiekt)
const upload = useCallback(
  async (file: File, type: PhotoType) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    try {
      const photo = await api.post<ProviderPhoto>(PHOTOS_KEY, formData);
      await mutate((prev = []) => [...prev.filter((p) => p.type !== type), photo], {
        revalidate: false,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Błąd przesyłania.');
      await mutate();
    }
  },
  [mutate],
);
```

### 15.3. Kiedy NIE używać SWR

| Przypadek                                | Zamiast SWR użyj                               |
| ---------------------------------------- | ---------------------------------------------- |
| Dane wysyłane raz (submit formularza)    | `useState` + `api.post` w `onSubmit` hooka RHF |
| State machine z timerami (OTP countdown) | czysty `useState` / `useReducer`               |
| Dane globalne (sesja użytkownika)        | `AuthContext` z własnym fetch                  |

SWR jest właściwy gdy: dane mogą się zmieniać w tle, wiele komponentów potrzebuje tych samych danych, albo po akcji użytkownika chcemy odświeżyć listę.

---

## 16. Upload plików — wzorzec NestJS

### 16.1. Multer — konfiguracja dysku

```typescript
// photos.controller.ts
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

@UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        // Ścieżka tymczasowa — serwis przenosi do właściwego katalogu po walidacji
        const tmp = path.join(UPLOADS_ROOT, 'tmp');
        fs.mkdirSync(tmp, { recursive: true });
        cb(null, tmp);
      },
      filename: (_req, _file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}`),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },  // 5 MB
  }),
)
```

### 16.2. Walidacja pliku — ParseFilePipe

```typescript
@Post()
upload(
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        new FileTypeValidator({ fileType: /image\/(jpeg|png|webp)/ }),
      ],
    }),
  )
  file: Express.Multer.File,
) { ... }
```

### 16.3. Czyszczenie pliku przy błędzie — try/finally w kontrolerze

Multer zapisuje plik na dysk PRZED wykonaniem logiki kontrolera. Jeśli cokolwiek po tym rzuci wyjątek, plik zostaje osierocony. Kontroler musi go usunąć:

```typescript
@Post()
async upload(@UploadedFile(...) file: Express.Multer.File, ...) {
  try {
    const provider = await this.providersService.findByUserId(userId);
    if (!provider) throw new ForbiddenException();
    return await this.photosService.upload(provider.id, file, body.type);
  } catch (err) {
    // Usuń plik jeśli serwis rzucił wyjątek po tym jak multer go zapisał
    fs.unlink(file.path, () => {});
    throw err;
  }
}
```

### 16.4. Relative storageKey — nie absolutne ścieżki

Przechowuj w bazie **względny klucz**, nie absolutną ścieżkę OS:

```typescript
// ✅ TAK — przenośne między środowiskami
const storageKey = `providers/${providerId}/${filename}`; // "providers/abc/1234.jpg"
const url = `/uploads/${storageKey}`;

// ❌ NIE — absolutna ścieżka jest unikalna dla maszyny
const storageKey = file.path; // "C:\opony\apps\api\uploads\tmp\1234.jpg"
```

Serwis `deleteFile()` rozwiązuje klucz do absolutnej ścieżki przez `path.join(process.cwd(), 'uploads', storageKey)`. Dla wstecznej kompatybilności obsługuje też absolutne ścieżki (warunek `startsWith('/')` lub `/^[A-Za-z]:/.test()`).

### 16.5. Bezpieczna zamiana (safe replace)

Przy typach single-slot (logo, zdjęcie pojazdu) nowy plik zastępuje stary. Kolejność operacji:

```
1. Utwórz nowy rekord w DB  ← jeśli to rzuci, plik tymczasowy jest już czyszczony przez catch w kontrolerze
2. Usuń stary plik z dysku  ← dopiero po udanym INSERT
3. Usuń stary rekord z DB   ← błąd tutaj jest non-fatal (rekord-sierota, nie blokuje użytkownika)
```

Nigdy: usuń stary → utwórz nowy. Jeśli create się nie powiedzie, stary jest już skasowany.

### 16.6. ServeStaticModule — serwowanie plików

```typescript
// app.module.ts
ServeStaticModule.forRoot({
  rootPath: path.join(process.cwd(), 'uploads'),
  serveRoot: '/uploads',
  serveStaticOptions: { index: false },
}),
```

Katalog `apps/api/uploads/` jest w `.gitignore`. Na produkcji zastąp S3/CDN — zmień tylko `storageKey` i logikę `deleteFile`/`url` w serwisie.
