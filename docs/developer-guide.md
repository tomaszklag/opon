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

DS `Input` i `Textarea` są `forwardRef` → działają bezpośrednio z `{...register('field')}` z RHF.

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

### 9.3. Reguły routingu — `canonicalRoute`

Jedyne źródło prawdy dla decyzji o przekierowaniu to funkcja w `lib/auth-routing.ts`:

```ts
canonicalRoute(user: AuthUser | null): '/login' | '/register' | '/onboarding/weryfikacja' | '/dashboard'
```

| `user`  | `providerId` | `status`     | Wynik                     |
| ------- | ------------ | ------------ | ------------------------- |
| `null`  | —            | —            | `/login`                  |
| present | brak         | —            | `/register`               |
| present | present      | ≠ `APPROVED` | `/onboarding/weryfikacja` |
| present | present      | `APPROVED`   | `/dashboard`              |

**Nigdy nie implementuj logiki przekierowań ręcznie.** Zawsze używaj `canonicalRoute`.

Możliwe wartości `status` (`ProviderStatus`):

| Wartość            | Znaczenie                                  |
| ------------------ | ------------------------------------------ |
| `PENDING_NIP`      | Onboarding niezakończony — brak NIP        |
| `PENDING_DOCS`     | Onboarding niezakończony — brak dokumentów |
| `PENDING_APPROVAL` | Czeka na ręczną weryfikację przez admina   |
| `APPROVED`         | Aktywny — dostęp do dashboardu             |
| `SUSPENDED`        | Zawieszony przez admina                    |
| `REJECTED`         | Odrzucony — nie może korzystać z panelu    |

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

#### Kiedy NIE używać react-hook-form

- **State machine z timerami** (`useLoginFlow`) — OTP flow, countdown, rate-limiting. Pojedyncza walidacja `digits.length !== 9` nie uzasadnia RHF.
- **Table editor z walidacją per-wiersz** (`useWorkingHours`) — 7 dni × kilka pól, walidacja czysto w `validate(): Record<dayOfWeek, string>`. `useFieldArray` byłoby tu nadmiarowe.

W tych przypadkach błąd po submit nadal trafia do `<NoticeBlock variant="danger">`, a błędy per-wiersz do `error` prop DS `Input`.

#### Schematy — zasady

- Jeden plik schema na domenę: `lib/schemas/<domena>.schema.ts`
- Eksportuj typ przez `z.infer<typeof schema>`: `export type FooValues = z.infer<typeof fooSchema>`
- Komunikaty błędów po polsku, konkretne: `'NIP musi mieć dokładnie 10 cyfr'` nie `'Wymagane'`
- Opcjonalne pola: `z.string().optional()` lub `z.string().max(n).optional()` — nie `z.string().nullable()`
