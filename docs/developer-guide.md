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

### 3.4. Prisma JSON → `Record<string, never>` — wzorzec override

Pola `Json` w Prisma schema (np. `Station.schedule Json`, `WorkingHours.blocks Json?`) są generowane przez openapi-typescript jako `Record<string, never>` — typ pusty, z którym nic nie można zrobić.

**W `api-data-access/`:** nadpisz typ przez `Omit + intersection`:

```ts
// api-data-access/stations.ts
import type { components } from '@opony/api-client';

type StationBase = components['schemas']['StationResponseDto'];

// schedule: Record<string, never> → zastępujemy właściwym typem
export type Station = Omit<StationBase, 'schedule'> & { schedule: DaySchedule[] };
```

**W backend DTO → Prisma:** tablica typowanych obiektów nie jest bezpośrednio assignowalna do `Prisma.InputJsonValue`. Użyj podwójnego casta:

```ts
// stations.service.ts
await this.stationsRepository.create(providerId, {
  schedule: dto.schedule as unknown as Prisma.InputJsonValue,
  //                       ^^^^^^^^ wymagane — DayScheduleDto[] nie pasuje do InputJsonObject
});
```

**Przy walidacji DTO:** dla JSON pola z zagnieżdżoną strukturą zawsze używaj `@ValidateNested` + `@Type()`:

```ts
export class CreateStationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayScheduleDto)
  schedule!: DayScheduleDto[];
}
```

### 3.5. Prisma enum → `string` — wzorzec override statusów

Pola enum w Prisma schema (np. `BookingStatus`, `ProviderStatus`) są generowane przez openapi-typescript jako `status: string` — bez konkretnych wartości. Wymagają ręcznego override'u dokładnie tak samo jak pola `Json`.

```ts
// api-data-access/bookings.ts
import type { components } from '@opony/api-client';

type BookingBase = components['schemas']['BookingResponseDto'];

// status: string → zastępujemy union type z konkretnymi wartościami
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED_BY_CLIENT'
  | 'CANCELLED_BY_PROVIDER'
  | 'CANCELLED_BY_SYSTEM'
  | 'NO_SHOW'
  | 'REJECTED';

export type Booking = Omit<BookingBase, 'status'> & { status: BookingStatus };
// Dla modelu z wieloma polami-enumami: Omit<Base, 'status' | 'role'> & { status: StatusUnion; role: RoleUnion }
```

Wartości unii muszą być identyczne z wartościami Prisma enum — przepisz je dosłownie z `schema.prisma`.

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

### 5.1. Obowiązujący wzorzec: Controller → Service → Repository

Każdy moduł BE musi używać wzorca trójwarstwowego. Repository jest obowiązkowe (nie opcjonalne) dla modułów z dostępem do bazy danych:

- **Controller** — przyjmuje request, waliduje DTO, wywołuje Service, zwraca response
- **Service** — logika biznesowa, walidacja domenowa, wywołuje Repository
- **Repository** — wyłącznie zapytania Prisma, zero logiki biznesowej

```ts
// stations.repository.ts — TYLKO zapytania do bazy
@Injectable()
export class StationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProvider(providerId: string): Promise<StationWithWorkers[]> {
    return this.prisma.station.findMany({
      where: { providerId },
      include: { workers: { include: { worker: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  create(
    providerId: string,
    data: { name: string; services: string[]; schedule: Prisma.InputJsonValue },
  ) {
    return this.prisma.station.create({
      data: { providerId, ...data },
      include: { workers: { include: { worker: true } } },
    });
  }
  // ...
}

// stations.service.ts — logika biznesowa, wywołuje repository
@Injectable()
export class StationsService {
  constructor(
    private readonly stationsRepository: StationsRepository,
    private readonly workersRepository: WorkersRepository,
  ) {}

  async create(providerId: string, dto: CreateStationDto): Promise<StationResponseDto> {
    const station = await this.stationsRepository.create(providerId, dto);
    return mapToDto(station);
  }
}
```

Moduły z repozytoriami: `providers`, `pricing-tiers`, `working-hours`, `stations`, `workers`.

### 5.2. Krok po kroku

```
1. Schemat Prisma
   └─ apps/api/prisma/schema.prisma  ← dodaj model
   └─ pnpm db:migrate --name add_<modul>

2. Moduł NestJS
   └─ apps/api/src/<modul>/
        ├─ <modul>.module.ts
        ├─ <modul>.controller.ts
        ├─ <modul>.service.ts
        ├─ <modul>.repository.ts   ← OBOWIĄZKOWE dla modułów z DB
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

Każdy tekst w JSX musi używać `<Heading>` lub `<Text>`. **Nigdy** nie definiuj `font-size`, `font-weight`, `line-height`, `letter-spacing`, `font-family` ani `color` w plikach CSS module dla elementów tekstowych — to wyłączna odpowiedzialność DS.

```tsx
import { Heading, Text } from '@opony/design-system-web';

// ✅ TAK
<Heading variant="section">Tytuł sekcji</Heading>
<Text variant="body-sm" as="span" weight="bold" color="muted">Label</Text>
<Text variant="nano" as="span" color="accent" mono>PRV-1234</Text>

// ❌ NIE
<h2 className={styles.title}>Tytuł</h2>         // .title definiuje font-*
<span style={{ fontSize: '12px' }}>Label</span>
<span className={styles.muted}>tekst</span>      // .muted ma color: var(--text-muted)
```

#### Text — propsy

| Prop      | Typ                                                                             | Opis                                                          |
| --------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `variant` | `body \| body-md \| body-sm \| caption \| label \| nano \| kicker \| kicker-sm` | Rozmiar i styl                                                |
| `as`      | `p \| span \| div \| label \| li \| strong \| em`                               | Tag HTML (domyślnie `p`)                                      |
| `color`   | `primary \| secondary \| muted \| accent \| warning \| danger`                  | Kolor tekstu — zamiast `color:` w CSS                         |
| `weight`  | `regular \| medium \| semibold \| bold \| extrabold`                            | Grubość — zamiast `font-weight:` w CSS                        |
| `mono`    | `boolean`                                                                       | Czcionka mono (JetBrains Mono) — zamiast `font-family:` w CSS |

> **`TextColor`** obejmuje: `primary | secondary | muted | accent | warning | danger`. Dla `success` prop `color` nie istnieje — jedynym wyjątkiem od reguły „no color in CSS" jest ten przypadek: zachowaj `color: var(--success)` w CSS module dla danego elementu.

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

`Heading` akceptuje też prop **`color`** o tych samych wartościach co `Text.color`: `primary | secondary | muted | accent | danger`. Używaj go zamiast `color:` w CSS dla elementów nagłówkowych.

```tsx
// ✅ TAK
<Heading variant="subsection" color="accent">
  Odpowiedzi
</Heading>

// ❌ NIE — color w CSS module
// .respTitle { color: var(--accent); }
```

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

#### Reguła: kontenery owijające DS `<Text>` nie mogą ustawiać typografii

Jeśli element CSS module pełni rolę **kontenera** (flex wrapper, grid cell, section) i jego bezpośrednie dzieci to komponenty DS `<Text>` lub `<Heading>`, **nie ustawiaj** na nim `font-size`, `color`, `line-height`, `font-weight` ani `font-family`. DS komponenty zarządzają tymi właściwościami wewnętrznie — właściwości na rodzicu kaskadują i nadpisują je.

```css
/* ❌ NIE — container ustawia font-size, który kaskaduje do <Text> */
.clientMeta {
  display: flex;
  gap: 4px;
  font-size: 13px; /* <-- kaskaduje do <Text variant="body-sm"> → nadpisuje DS */
  color: var(--text-muted); /* <-- nadpisuje color prop w <Text> */
}

/* ✅ TAK — container tylko layout */
.clientMeta {
  display: flex;
  gap: 4px;
}
/* Jeśli niebędące DS dziecko (np. <time>) wymaga rozmiaru — dodaj mu własną klasę */
.clientMetaTime {
  font-size: 13px;
}
```

Naruszenie tej reguły jest trudne do wykrycia — DS Text nadal renderuje się poprawnie, ale różni się od zamierzonego projektu (zły rozmiar, kolor). Traktuj go jak błąd DS compliance.

Reguła obowiązuje **dwustronnie**: nie tylko dla klas na rodzicach, ale również dla klas aplikowanych bezpośrednio do DS komponentów. Jeśli dodajesz `className` do `<Text>` lub `<Heading>`, ta klasa może zawierać wyłącznie właściwości layoutowe (`width`, `margin`, `flex`, `grid-*`). Typografia należy do propsów komponentu.

```tsx
// ❌ NIE — line-height na klasie przyklejonej bezpośrednio do <Text>
// .reviewText { line-height: 1.55; }
<Text variant="body" className={styles.reviewText}>...</Text>

// ❌ NIE — font-size na klasie przyklejonej bezpośrednio do <Text as="span">
// .respUnit { font-size: 18px; color: var(--accent); }
<Text as="span" className={styles.respUnit}>%</Text>

// ✅ TAK — typography przez propsy, className tylko dla geometrii
<Text as="span" variant="body-md" color="accent" className={styles.respUnit}>%</Text>
// .respUnit { margin-left: 2px; }   ← tylko layout
```

#### Anty-wzorzec: `<strong>` wewnątrz `<Text>`

Wbudowany tag `<strong>` wewnątrz `<Text>` stosuje bold poza kontrolą DS (browser default, nie zmienna DS). Zamiast tego zagnieżdź `<Text as="span" weight="bold">`:

```tsx
// ❌ NIE — bold poza DS
<Text variant="nano" as="span" mono>
  Panel <strong>v0.1.0</strong> · pilot
</Text>

// ✅ TAK — bold przez prop DS
<Text variant="nano" as="span" mono>
  Panel{' '}
  <Text variant="nano" as="span" weight="bold" mono>v0.1.0</Text>
  {' '}· pilot
</Text>
```

#### Wzorzec: badge/pill z DS `<Text>`

Elementy o podwójnej roli (pudełko + tekst z typografią) — np. numerki sekcji, status-pille, etykiety — powinny renderować treść przez `<Text>`, a klasę CSS module zarezerwować wyłącznie dla geometrii pudełka:

```tsx
// ✅ TAK — CSS module tylko layout, typografia w DS
<Text variant="nano" as="span" weight="extrabold" mono className={styles.secNum}>
  01
</Text>

// Jeśli badge ma kilka stanów kolorystycznych (np. normalny / accent / danger),
// kolory stanu definiuj w CSS module — nie przez prop color na <Text>:
<Text variant="nano" as="span" weight="extrabold" mono className={`${styles.secNum} ${styles.secNumAccent}`}>
  02
</Text>
```

```css
/* ✅ TAK — CSS module bez typografii (font-*, color usunięte) */
.secNum {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--bg);
  border: 1px solid var(--border);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  flex-shrink: 0; /* color OK — stan pudełka, nie treść */
}
.secNumAccent {
  background: var(--accent);
  color: var(--text-on-accent);
  border-color: transparent;
}
.secNumDanger {
  background: var(--danger);
  color: var(--bg);
  border-color: transparent;
}
```

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

### Zasada: brakująca funkcja DS → rozszerz DS, nie omijaj

Jeśli istniejący komponent DS nie obsługuje potrzebnego wariantu, stanu lub propsa — **rozszerz DS** (dodaj prop + CSS do DS), nie twórz lokalnego obejścia w panelu.

Lokalnym obejściem jest m.in.:

- duplikat komponentu DS z ręcznie dopisanym stylem
- warunkowy `className` w panelu symulujący brakujący wariant DS
- ukrycie komponentu + własny HTML

Przykład z B2B-10: `<Tabs>` nie miał wariantu ostrzegawczego dla licznika zakładki. Właściwe rozwiązanie:

```typescript
// packages/design-system-web/src/display/Tabs/Tabs.tsx
export interface Tab {
  key: string;
  label: string;
  count?: number;
  countWarn?: boolean; // ← nowy prop dodany do DS
}
```

```css
/* Tabs.module.css */
.count.countWarn {
  background: var(--warning-muted);
  border-color: var(--warning-border);
  color: var(--warning);
}
```

Zamiast CSS w panelu-app dla konkretnego użycia. Rozszerzenie DS jest wielokrotnego użytku i pozostaje w jednym miejscu.

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

### Czego DS celowo nie ma — i co robić zamiast

DS nie zawiera specjalistycznych pickerów przeglądarki. Nie szukaj ich — nie istnieją. Zamiast tego:

| Brakujący komponent DS        | Właściwe podejście                                                                                  |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `<Input type="time" />`       | Natywny `<input type="time" />` owinięty w `<label className={styles.timeInput}>` z CSS module      |
| `<Input type="date" />`       | Natywny `<input type="date" />` — analogicznie                                                      |
| `<Input type="number" />`     | DS `<Input type="number" />` działa — ustaw `className` tylko dla geometrii (width, text-align)     |
| `<input type="checkbox" />`   | DS `<Toggle>` (switch) lub natywny `<input type="checkbox">` z CSS module — zależy od designu       |
| Color picker, date-range, ... | Natywne elementy + CSS module bez inline styles. Dodaj komentarz `{/* DS nie ma */}` przy elemencie |

**Zasada:** jeśli natywny element jest niezbędny, owin go w strukturę z CSS module — bez inline `style={}`, bez hardcoded wartości. Sam `<input>` może być natywny; jego opakowanie musi respektować tokeny.

```tsx
{
  /* ✅ TAK — natywny input, ale bez inline styles */
}
<label className={styles.timeInput}>
  <Text variant="nano" as="span" color="muted">
    Od
  </Text>
  <input type="time" value={value} onChange={onChange} />
</label>;

{
  /* ❌ NIE — inline styles z wartościami */
}
<input type="time" style={{ border: '1px solid #333', fontSize: '13px' }} />;
```

### DS Button — warianty i rozmiary

Wariant określa **wyłącznie schemat kolorów**. Rozmiar określa **wyłącznie wymiary**. Nigdy nie umieszczaj `height`, `padding` ani `font-size` w wariancie — i odwrotnie, nie umieszczaj kolorów w rozmiarze.

#### Warianty

| Wariant          | Kiedy używać                                                                  |
| ---------------- | ----------------------------------------------------------------------------- |
| `primary`        | Główna akcja strony (submit, Dalej, Zapisz). Zawsze tylko jeden.              |
| `secondary`      | Akcja alternatywna z akcentem — np. „Dodaj kolejny".                          |
| `neutral`        | Nawigacja wstecz, Anuluj — przezroczysty, obramowanie `--border`.             |
| `ghost`          | Akcja w toolbarze/nagłówku — przezroczysty, bez obramowania.                  |
| `danger`         | Destruktywne operacje (Usuń konto, Odrzuć) — wypełnienie czerwienią.          |
| `neutral-danger` | Wtórne destruktywne akcje — outline czerwony (transparent bg, danger border). |
| `link`           | Inline link-button — bez obramowania, kolor akcentu.                          |
| `cta`            | Jednorazowe hero-CTA na stronach auth (Bebas Neue, persistent glow)           |

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
--hairline          rgba(255,255,255,0.06)  ← subtelna linia/highlight na ciemnym tle
--accent, --accent-hover, --accent-dark
--accent-muted      rgba(255,107,26, 0.14)
--accent-border     rgba(255,107,26, 0.32)
--accent-glow       rgba(255,107,26, 0.45)
--success, --success-muted, --success-border
--warning, --warning-muted, --warning-border
--danger, --danger-muted, --danger-border
--info, --info-muted, --info-border         ← niebieski (stan „w trakcie"), analogicznie do success/warning

/* shadows */
--shadow-sm / --shadow-md / --shadow-lg   ← cienie neutralne (czarne)
--shadow-accent                           ← glow (0 0 20px accent-glow) — używany na hover
--shadow-accent-lift                      ← elevation + kolor (0 8px 20px rgba(255,107,26,0.35))
                                            wbudowany w Button variant="primary" (base state)
```

Wartości bez tokenu (np. specyficzne przezroczystości w gradientach tła) mogą pozostać hardcoded — ale to wyjątek, nie reguła.

#### Częściowa przezroczystość tokenu — `color-mix()`

Gdy potrzebujesz tokenu z niestandardową przezroczystością i nie istnieje dedykowany token, użyj `color-mix()` zamiast `rgba()`:

```css
/* ✅ TAK */
border-left: 1px solid color-mix(in srgb, var(--bg) 25%, transparent);
background: color-mix(in srgb, var(--surface) 40%, transparent);

/* ❌ NIE */
border-left: 1px solid rgba(255, 255, 255, 0.25); /* hardcoded rgba zamiast tokenu */
```

`color-mix(in srgb, TOKEN X%, transparent)` oznacza: X% koloru tokenu, reszta przezroczysta.

### Kolory spoza palety DS — lokalne zmienne CSS

Niektóre elementy wymagają kolorów których nie ma w tokenach DS (np. paleta avatarów pracowników: niebieski, zielony, fioletowy). W takim przypadku zdefiniuj lokalne zmienne na początku CSS module:

```css
/* ✅ TAK — lokalne zmienne CSS w module */
/* stations.module.css */
:root {
  --avatar-blue-light: #3b82f6;
  --avatar-blue-dark: #1d4ed8;
  --avatar-green-light: #2ee0a0;
  --avatar-green-dark: #059669;
  --avatar-purple-light: #a855f7;
  --avatar-purple-dark: #7c3aed;
}

.avatarBlue {
  background: linear-gradient(135deg, var(--avatar-blue-light), var(--avatar-blue-dark));
  color: #fff; /* kontrast wymagany przez dostępność */
}

/* ❌ NIE — hardcoded hex bezpośrednio w selektorze */
.avatarBlue {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #fff;
}
```

Zasada: hardcoded wartości dozwolone tylko jako wartości zmiennych CSS — nigdy bezpośrednio w selektorze. Dzięki temu łatwo znaleźć i zmienić cały schemat kolorystyczny modułu.

#### DS Input — `className` trafia na wewnętrzny `<input>`

Prop `className` DS `Input` jest przekazywany na wewnętrzny element `<input>`, nie na wrapper. Używaj wyłącznie do nadpisywania geometrii dla inputów liczbowych:

```css
/* ✅ OK — szerokość i wyrównanie dla inputów liczbowych */
.priceInputNum {
  width: 68px;
  text-align: right;
  font-family: var(--font-mono);
  font-weight: var(--font-bold);
}

/* ❌ NIE — typografia semantyczna (rozmiar, kolor) należy do DS Input */
.priceInputNum {
  font-size: 18px;
  color: var(--accent);
}
```

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
canonicalRoute(user: AuthUser | null): AuthRoute
// AuthRoute = '/login' | '/register' | '/onboarding/zdjecia' | '/onboarding/weryfikacja' | '/dashboard' | '/admin/providers'
```

| `user`  | `role`  | `providerId` | `status`                                        | Wynik                     |
| ------- | ------- | ------------ | ----------------------------------------------- | ------------------------- |
| `null`  | —       | —            | —                                               | `/login`                  |
| present | `ADMIN` | —            | —                                               | `/admin/providers`        |
| present | inne    | brak         | —                                               | `/register`               |
| present | inne    | present      | `PENDING_DOCS` lub `PENDING_NIP`                | `/onboarding/zdjecia`     |
| present | inne    | present      | ≠ `APPROVED`, ≠ `PENDING_DOCS`, ≠ `PENDING_NIP` | `/onboarding/weryfikacja` |
| present | inne    | present      | `APPROVED`                                      | `/dashboard`              |

**Nigdy nie implementuj logiki przekierowań ręcznie.** Zawsze używaj `canonicalRoute`.

Sprawdzanie roli jest **pierwszą** regułą po null-check — admin nie potrzebuje providerId ani statusu.

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

### 9.5. RBAC — Role-Based Access Control

Backend używa dwuwarstwowego systemu guardów rejestrowanych globalnie jako `APP_GUARD` w `AppModule`:

1. `JwtAuthGuard` — weryfikuje JWT (wszystkie trasy, chyba że `@Public()`)
2. `RolesGuard` — sprawdza `@Roles()` dekorator (jeśli brak dekoratora → przepuszcza)

**Ochrona endpointu tylko dla admina:**

```ts
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('v1/admin/something')
@UseGuards(RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminSomethingController { ... }
```

`RolesGuard` czyta pole `role` z JWT payload (`JwtPayload.role`). Brak wymaganej roli → 403 Forbidden.

**Role użytkowników:**

| Rola             | Opis                                                   |
| ---------------- | ------------------------------------------------------ |
| `CLIENT`         | Klient z mobilnej apki — nie ma dostępu do panelu      |
| `PROVIDER_OWNER` | Właściciel warsztatu — onboarding + dashboard          |
| `PROVIDER_STAFF` | Pracownik warsztatu — zdefiniowany, jeszcze nieużywany |
| `ADMIN`          | Administrator — panel `/admin/*`                       |

### 9.6. Unieważnianie sesji

Sesję (JWT) unieważniamy gdy zmienia się istotny stan użytkownika i chcemy wymusić świeży token. Wzorzec:

```ts
// Unieważnij wszystkie aktywne sesje użytkownika
await this.prisma.session.updateMany({
  where: { userId: ownerId, revokedAt: null },
  data: { revokedAt: new Date() },
});
```

**Kiedy unieważniać:**

- Admin zatwierdza providera (`PENDING_APPROVAL → APPROVED`) — wymagany nowy JWT z aktualnym statusem, żeby routing trafił na `/dashboard`
- Reset hasła / zmiana numeru telefonu (jeśli zaimplementowane)

**Kiedy NIE unieważniać:**

- Weryfikacja emaila — czysto informacyjna, nie zmienia routingu ani uprawnień
- Aktualizacja danych firmy (nazwa, opis, zdjęcia)

Po unieważnieniu: przy kolejnym API request `JwtAuthGuard` przyjmie token (jest jeszcze ważny przez 15 min), ale przy próbie odświeżenia (`/refresh`) backend znajdzie sesję jako `revokedAt != null` → zwróci 401 → interceptor wyloguje użytkownika.

### 9.7. Rola = CLIENT

Jeśli `user.role === 'CLIENT'` po OTP — to numer klienta (z mobilnej aplikacji), nie providera. Nie rób redirect — pokaż `clientRoleError` (komunikat w OtpStep: „To numer klienta. Aby otworzyć panel, zarejestruj warsztat."). `canonicalRoute` nie obsługuje roli CLIENT — guard logowania musi wykryć ją przed wywołaniem funkcji.

---

## 10. Obsługa błędów API

### 10.1. Backend — AppException i ErrorCode

Zamiast wbudowanych wyjątków NestJS (`BadRequestException`, `NotFoundException` itp.) używamy **wyłącznie** `AppException` z `apps/api/src/common/errors/`:

```ts
import { AppException, ErrorCode } from '../common/errors';

// ✅ TAK
throw new AppException(ErrorCode.PROVIDER_NOT_FOUND, 'Firma nie istnieje.', 404);
throw new AppException(ErrorCode.GUS_NIP_NOT_FOUND, 'NIP nie znaleziony w CEIDG.', 404);
throw new AppException(ErrorCode.PRICING_TIER_RANGE_CONFLICT, 'Przedział felg już zajęty.', 409);

// ❌ NIE — nie używaj wbudowanych wyjątków NestJS w serwisach
throw new NotFoundException('Firma nie istnieje.');
throw new BadRequestException('Błąd walidacji.');
throw new ConflictException('Już istnieje.');
```

Globalny `HttpExceptionFilter` (zarejestrowany w `main.ts`) gwarantuje jeden kształt każdej odpowiedzi błędu:

```json
{
  "code": "PROVIDER_NOT_FOUND",
  "message": "Firma nie istnieje.",
  "statusCode": 404
}
```

### 10.2. ErrorCode enum — wszystkie kody

Plik: `apps/api/src/common/errors/error-code.enum.ts`

| Prefiks            | Zakres                                                                                        |
| ------------------ | --------------------------------------------------------------------------------------------- |
| `AUTH_*`           | Sesja, token, użytkownik (`AUTH_USER_NOT_FOUND`, `AUTH_UNAUTHORIZED`, …)                      |
| `OTP_*`            | Kod SMS (`OTP_INVALID_OR_EXPIRED`, `OTP_RATE_LIMIT_EXCEEDED`)                                 |
| `PROVIDER_*`       | Firma, status (`PROVIDER_NOT_FOUND`, `PROVIDER_ALREADY_EXISTS`, `PROVIDER_INVALID_STATUS`, …) |
| `GUS_*`            | Weryfikacja CEIDG (`GUS_NIP_NOT_FOUND`, `GUS_INVALID_NIP`, `GUS_CONNECTION_ERROR`)            |
| `PHOTO_*`          | Zdjęcia (`PHOTO_NOT_FOUND`, `PHOTO_ACCESS_DENIED`, `PHOTO_ADDITIONAL_LIMIT_EXCEEDED`)         |
| `PRICING_TIER_*`   | Cennik (`PRICING_TIER_NOT_FOUND`, `PRICING_TIER_RANGE_CONFLICT`, …)                           |
| `WORKING_HOURS_*`  | Godziny pracy (`WORKING_HOURS_MISSING_TIMES`, `WORKING_HOURS_INVALID_TIME_RANGE`)             |
| `VALIDATION_ERROR` | Błąd walidacji DTO (class-validator)                                                          |
| `INTERNAL_ERROR`   | Nieokreślony błąd serwera                                                                     |

**Gdy dodajesz nowy błąd:** dodaj kod do enum, użyj `AppException`. Nie twórz jednorazowych stringów.

### 10.3. Frontend — ApiError.code i useErrorToast

`ApiError` (w `lib/api.ts`) ma pole `code?: string` parsowane z `body.code`. Sprawdzaj kod **przed** fallbackiem na status HTTP:

```ts
// ✅ TAK — najpierw kod, potem status jako fallback
if (err instanceof ApiError && (err.code === 'GUS_NIP_NOT_FOUND' || err.status === 404)) {
  setGusError('NIP nie znaleziony w rejestrze GUS / CEIDG.');
}

if (err instanceof ApiError && (err.code === 'PROVIDER_ALREADY_EXISTS' || err.isConflict)) {
  setApiError('Firma z tym NIPem już istnieje.');
}

// ❌ NIE — porównywanie message jest kruche (backend może zmienić tekst)
if (err.message === 'Firma nie istnieje.') { ... }
```

Do wyświetlania błędów w toastach (poza formularzami) użyj hooka `useErrorToast`:

```ts
import { useErrorToast } from '../../lib/hooks/use-error-toast';

const { showError } = useErrorToast();

// Prosty toast z message z backendu
showError(err);

// Toast z własną wiadomością dla konkretnego kodu
showError(err, {
  codeMessages: {
    PRICING_TIER_RANGE_CONFLICT: 'Ten przedział felg już istnieje.',
    PHOTO_ADDITIONAL_LIMIT_EXCEEDED: 'Osiągnięto limit 10 zdjęć.',
  },
  defaultMessage: 'Błąd zapisu. Spróbuj ponownie.',
});
```

`<Toaster />` jest zarejestrowany globalnie w `app/layout.tsx` — nie dodawaj go w poszczególnych stronach.

---

## 11. Linting i formatowanie

```bash
pnpm lint            # ESLint na całym monorepo (auto-fix)
pnpm type-check      # tsc --noEmit na wszystkich aplikacjach
```

Husky uruchamia lint-staged automatycznie przy `git commit`:

- `**/*.{ts,tsx,js,jsx}` → `eslint --fix` + `prettier --write`
- `**/*.{json,md,yaml,yml}` → `prettier --write`

Jeśli commit się nie udaje przez hook — nie używaj `--no-verify`. Napraw problem i spróbuj ponownie.

---

## 12. Testowanie

```bash
pnpm test            # Vitest — unit + integration (wszystkie apps)
pnpm test:e2e        # Playwright — E2E (wymaga działającego dev env)

# Tylko jeden pakiet
pnpm --filter api test
pnpm --filter @opony/panel test
```

MSW mockuje API w testach FE i w dev (`NEXT_PUBLIC_API_MOCK=true`). Handlery: `apps/panel/mocks/handlers/`.

---

## 13. Przydatne one-linery

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

## 14. Formularze — walidacja i obsługa błędów

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
      // Sprawdź err.code dla konkretnych przypadków, fallback na err.message
      if (err instanceof ApiError && err.code === 'FOO_CONFLICT') {
        setApiError('Ten zasób już istnieje.');
      } else {
        setApiError(err instanceof ApiError ? err.message : 'Błąd. Spróbuj ponownie.');
      }
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

## 15. Integracje z zewnętrznymi API

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
      throw new AppException(
        ErrorCode.GUS_CONNECTION_ERROR,
        'Błąd połączenia z zewnętrznym serwisem.',
        502,
      );
    }

    if (response.status === 404)
      throw new AppException(ErrorCode.GUS_NIP_NOT_FOUND, 'NIP nie znaleziony w CEIDG.', 404);

    if (response.status === 400) {
      const body = (await response.json().catch(() => ({}))) as { code?: string };
      if (body.code === 'NIEPOPRAWNY_NUMER_NIP')
        throw new AppException(ErrorCode.GUS_INVALID_NIP, 'Nieprawidłowy NIP.', 400);
      throw new AppException(
        ErrorCode.GUS_REQUEST_ERROR,
        'Błąd zapytania do zewnętrznego API.',
        502,
      );
    }

    if (!response.ok)
      throw new AppException(ErrorCode.GUS_CONNECTION_ERROR, `Błąd API: ${response.status}`, 502);

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
    throw new AppException(ErrorCode.GUS_INVALID_NIP, 'NIP musi mieć dokładnie 10 cyfr.', 400);
  }
  return this.service.lookupByNip(nip);
}
```

---

## 16. System emaili

### 15.1. Architektura modułu

Email jest zaimplementowany jako globalny moduł NestJS (`@Global()`) w `apps/api/src/email/`:

```
apps/api/src/email/
  ├─ email.module.ts                 ← @Global(), eksportuje oba serwisy
  ├─ email.service.ts                ← wysyłka przez Resend SDK + zapis do EmailLog
  ├─ email-verification.service.ts   ← cykl życia tokenów weryfikacyjnych
  └─ templates/
     └─ email.templates.ts           ← funkcje zwracające HTML string (bez template engine)
```

Moduł jest `@Global()` — nie importuj go w ProvidersModule / AdminModule / AuthModule osobno.

### 15.2. Modele Prisma

#### EmailVerificationToken

Jednorazowy token weryfikacji emaila providera:

- `tokenHash: String @unique` — SHA-256(rawToken); raw token **nigdy nie trafia do bazy** (wzorzec z `Session.tokenHash`)
- `expiresAt: DateTime` — TTL 24h od wygenerowania
- `usedAt: DateTime?` — ustawiane przy weryfikacji; jednorazowość bez usuwania rekordu
- `onDelete: Cascade` — usunięcie Providera czyści tokeny

#### EmailLog

Historia wysłanych maili:

- `type: EmailType` — enum: `EMAIL_VERIFICATION | SUBMISSION_RECEIVED | ACCOUNT_APPROVED | ACCOUNT_REJECTED`
- `sentAt: DateTime` — timestamp wysyłki (zapisywany zawsze, nawet przy błędzie)
- `error: String?` — `null` = sukces, string = komunikat błędu z Resend

#### Provider — nowe pole

- `emailVerifiedAt: DateTime?` — kiedy provider potwierdził email; `null` = niepotwierdzony

### 15.3. Typy maili i punkty integracji

| Typ                   | Trigger                                                   | Gdzie wywołać                              |
| --------------------- | --------------------------------------------------------- | ------------------------------------------ |
| `EMAIL_VERIFICATION`  | `ProvidersService.create()` gdy `provider.email` istnieje | `EmailVerificationService.createAndSend()` |
| `SUBMISSION_RECEIVED` | `ProvidersService.submitForApproval()`                    | `EmailService.sendSubmissionReceived()`    |
| `ACCOUNT_APPROVED`    | `AdminProvidersService.approveProvider()`                 | `EmailService.sendAccountApproved()`       |
| `ACCOUNT_REJECTED`    | `AdminProvidersService.rejectProvider()`                  | `EmailService.sendAccountRejected()`       |

### 15.4. Endpoint weryfikacji emaila

```
GET /v1/auth/verify-email?token=xxx
```

- `@Public()` — nie wymaga auth (link otwierany bezpośrednio z klienta pocztowego)
- Weryfikuje token (hash, `expiresAt > now`, `usedAt == null`)
- Ustawia `provider.emailVerifiedAt` i `token.usedAt` w jednej transakcji
- Response: **redirect** (nie JSON)
  - Sukces → `${PANEL_URL}/verify-email?success=1`
  - Błąd → `${PANEL_URL}/verify-email?error=invalid`

### 15.5. Zasady projektowe

**Błędy wysyłki nie propagują się.** Jeśli Resend zwróci błąd, serwis łapie go (`Logger.error`) i zapisuje w `EmailLog.error`, ale operacja biznesowa (np. zapis Providera) **nie jest przerywana**. Provider musi być zapisany niezależnie od stanu systemu emaili.

**Raw token nigdy w bazie.** Tylko `SHA-256(rawToken)` trafia do `tokenHash`. Generowanie:

```typescript
import { randomBytes, createHash } from 'crypto';
const rawToken = randomBytes(32).toString('hex');
const tokenHash = createHash('sha256').update(rawToken).digest('hex');
```

**EmailLog zawsze zapisywany** — umożliwia audit i przyszły retry.

### 15.6. Zmienne środowiskowe

```env
RESEND_API_KEY=           # klucz z Resend dashboard
RESEND_FROM_EMAIL=noreply@opony.app
PANEL_URL=http://localhost:3000   # URL panelu (dla redirectów weryfikacji)
```

### 15.7. Testowanie emaili w dev

Mailpit działa lokalnie na `http://localhost:8025` (uruchamiany przez `pnpm docker:up`). Przechwytuje wszystkie wychodzące maile gdy `RESEND_API_KEY` jest placeholderem — sprawdź w WebUI czy mail dotarł.

Flow weryfikacji możesz testować w Prisma Studio (`pnpm db:studio`): po `POST /v1/providers` znajdź rekord w tabeli `EmailVerificationToken`, skopiuj `tokenHash` i sprawdź że `emailVerifiedAt` na Providerze ustawia się po GET `/v1/auth/verify-email`.

---

## 17. Pobieranie danych w FE — SWR

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

## 18. Strony z edycją ręczną — dirty state i navigation guard

Strony z ręcznym zapisem (przycisk „Zapisz", nie auto-save) wymagają trzech mechanizmów: śledzenia niezapisanych zmian, możliwości cofnięcia i blokady nawigacji.

### Wzorzec dirty state + revert

```typescript
// lib/hooks/use-foo-editor.ts
const [drafts, setDrafts] = useState<Draft[]>([]);
const [savedDrafts, setSavedDrafts] = useState<Draft[]>([]); // snapshot po każdym save
const [dirty, setDirty] = useState(false);

function updateDraft(idx: number, patch: Partial<Draft>) {
  setDrafts((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  setDirty(true);
}

function revert() {
  setDrafts(savedDrafts); // przywróć snapshot
  setDirty(false);
  setErrors([]);
}

async function save() {
  // ... zapis do API ...
  setSavedDrafts(drafts); // aktualizuj snapshot
  setDirty(false);
}
```

**Reguła:** `savedDrafts` (i odpowiadające mu `savedXxx` dla każdego stanu edytora) są aktualizowane wyłącznie po udanym `save()`. `revert()` zawsze przywraca do ostatniego stanu z serwera.

### Navigation guard — blokada wyjścia ze strony

Każda strona z `dirty` state **musi** używać `useNavigationGuard`. Bez niego użytkownik straci zmiany klikając link w sidebarze.

```typescript
// page.tsx
import { useNavigationGuard } from '../../../lib/hooks/use-navigation-guard';
import { Modal } from '@opony/design-system-web';

const { dirty } = useFooEditor();
const { showModal, confirm, cancel } = useNavigationGuard(dirty);

return (
  <>
    <Modal
      isOpen={showModal}
      onClose={cancel}
      title="Niezapisane zmiany"
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={cancel}>Zostań na stronie</Button>
          <Button variant="danger" size="sm" onClick={confirm}>Opuść bez zapisywania</Button>
        </>
      }
    >
      <Text variant="body-sm" as="p" color="secondary">
        Masz niezapisane zmiany. Jeśli opuścisz tę stronę, zmiany zostaną utracone.
      </Text>
    </Modal>
    {/* reszta strony */}
  </>
);
```

Hook `useNavigationGuard` obsługuje dwa scenariusze:

- **Przeglądarka** (refresh, zamknięcie karty, bezpośredni URL) → `beforeunload`
- **In-app** (klik w link/sidebar Next.js) → przechwytuje `window.history.pushState`

Guard dezaktywuje się automatycznie gdy `isDirty = false` (po save lub revert).

### Action bar — spójny wzorzec

```tsx
// _components/FooActionBar.tsx
{
  dirty && !saved && (
    <Text variant="label" as="span" className={styles.dirtyChip}>
      Niezapisane zmiany
    </Text>
  );
}
{
  saved && (
    <Text variant="label" as="span" className={styles.savedChip}>
      Zapisano
    </Text>
  );
}
{
  dirty && (
    <Button variant="ghost" size="sm" onClick={onRevert}>
      Cofnij
    </Button>
  );
}
<Button variant="primary" size="sm" onClick={onSave} loading={saving} disabled={!dirty}>
  Zapisz
</Button>;
```

---

## 19. Upload plików — wzorzec NestJS

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

---

## 20. Model usług — zamknięta lista

Platforma definiuje dokładnie **4 usługi**. Provider nie może dodawać własnych — tylko włączać/wyłączać togglem i ustawiać ceny.

| ID usługi         | Nazwa                 | Opis                                                                                   |
| ----------------- | --------------------- | -------------------------------------------------------------------------------------- |
| `SEASONAL_SWAP`   | Sezonowa wymiana opon | Pakiet all-in: demontaż + montaż + wyważanie + wentyle. Klient nie wybiera składowych. |
| `WHEEL_SWAP`      | Wymiana kół           | Zdjęcie/założenie kompletnych kół (bez wyważania).                                     |
| `BALANCING`       | Wyważanie kół         | Samo wyważanie (bez demontażu).                                                        |
| `PUNCTURE_REPAIR` | Naprawa opony         | Wulkanizacja uszkodzonej opony.                                                        |

### SizeTier — warianty rozmiaru

Rozmiar felgi jest reprezentowany przez enum `SizeTier` (trzy widelki). Używany zarówno w `PricingTier` (cennik providera), jak i w `Booking` (rozmiar zamówiony przez klienta):

| `SizeTier` | Opis   | Typowe rozmiary felg |
| ---------- | ------ | -------------------- |
| `S`        | Mały   | ≤ R15                |
| `M`        | Średni | R16–R17              |
| `L`        | Duży   | ≥ R18                |

Provider może mieć do 3 rekordów `PricingTier` — jeden na każdy tier. Identyfikatorem jest `@@unique([providerId, sizeTier])`.

### Model Prisma — PricingTier

```prisma
model PricingTier {
  id                        String   @id @default(uuid())
  providerId                String
  sizeTier                  SizeTier // S | M | L
  priceSwapPln              Decimal  @db.Decimal(10, 2)
  priceBalancingPerWheelPln Decimal? @db.Decimal(10, 2)
  travelFeeFirstKmPln       Decimal  @default(0) @db.Decimal(10, 2)
  travelFeeExtraKmPln       Decimal  @default(0) @db.Decimal(10, 2)

  provider Provider  @relation(fields: [providerId], references: [id], onDelete: Cascade)

  @@unique([providerId, sizeTier])   // maks. 3 tiery per provider (S, M, L)
  @@map("pricing_tiers")
}

enum SizeTier {
  S   // ≤ R15
  M   // R16–R17
  L   // ≥ R18
}
```

**Uwaga:** `PricingTier` to cennik providera zarządzany na stronie B2B Cennik (`/settings/pricing`). Nie mylić z `ServiceConfig` — patrz niżej.

### ServiceConfig — konfiguracja usługi per provider

`ServiceConfig` zastąpi `PricingTier` w przyszłych iteracjach jako bardziej szczegółowy model cen per usługa. W sprint 1 oba modele koegzystują.

Każda usługa (`ServiceConfig`) ma trzy warianty rozmiaru opony odpowiadające `SizeTier`:

| Wariant | Zakres  |
| ------- | ------- |
| `S`     | ≤ R15   |
| `M`     | R16–R17 |
| `L`     | ≥ R18   |

Dodatkowo każdy wariant może mieć **modyfikator ALU** (opcjonalne) — osobna cena i czas za felgi aluminiowe.

### TPMS

TPMS (czujnik ciśnienia) **nie jest osobną usługą** — to pytanie uzupełniające (tak/nie) wyświetlane klientowi po wyborze usługi. Provider ustawia cenę i czas per koło w konfiguracji warsztatu.

### Model Prisma — ServiceConfig

```prisma
model ServiceConfig {
  id          String      @id @default(cuid())
  providerId  String
  serviceId   ServiceType // enum: SEASONAL_SWAP | WHEEL_SWAP | BALANCING | PUNCTURE_REPAIR
  enabled     Boolean     @default(false)

  // Ceny i czasy per wariant S/M/L
  priceSPln   Decimal?
  priceMPln   Decimal?
  priceLPln   Decimal?
  durationSMin Int?
  durationMMin Int?
  durationLMin Int?

  // Modyfikator ALU (opcjonalny)
  aluExtraPln  Decimal?
  aluExtraMin  Int?

  // TPMS (opcjonalny)
  tpmsEnabled    Boolean   @default(false)
  tpmsPricePln   Decimal?
  tpmsTimeMin    Int?

  provider    Provider    @relation(fields: [providerId], references: [id], onDelete: Cascade)

  @@unique([providerId, serviceId])
  @@map("service_configs")
}

enum ServiceType {
  SEASONAL_SWAP
  WHEEL_SWAP
  BALANCING
  PUNCTURE_REPAIR
}
```

---

## 21. Stanowiska i pracownicy

### Koncepcja

**Stanowisko** = fizyczne miejsce pracy (lifter, wyważarka itp.). Stanowisko:

- ma przypisanych pracowników (1 lub więcej, różne zmiany),
- obsługuje podzbiór usług platformy,
- ma własny grafik tygodniowy niezależny od godzin warsztatu.

**Pracownik** może być przypisany do wielu stanowisk (praca zmianowa). Urlop pracownika blokuje go we wszystkich przypisanych stanowiskach.

### WorkingHours vs Station.schedule — podział odpowiedzialności

Te dwa modele **nie są duplikatami** — mają różne role i oba są wymagane przez slot engine:

| Model              | Tabela                     | Zarządzane na stronie | Rola                                                                                   |
| ------------------ | -------------------------- | --------------------- | -------------------------------------------------------------------------------------- |
| `WorkingHours`     | `working_hours`            | B2B "Godziny pracy"   | Godziny otwarcia **warsztatu** (budynku). Zewnętrzna granica dla wszystkich stanowisk. |
| `Station.schedule` | `stations.schedule` (JSON) | B2B "Stanowiska"      | Harmonogram konkretnego **stanowiska**. Może być węższy niż WorkingHours.              |

Przykład: warsztat otwarty Pn–Pt 08:00–18:00 (`WorkingHours`), ale Stanowisko A pracuje tylko Pn–Śr 08:00–14:00 (`Station.schedule`).

**Slot engine używa obu** — w kolejności:

1. Sprawdza `WorkingHours.isClosed == false` dla danego dnia (warsztat otwarty)
2. Sprawdza `Station.schedule[dayOfWeek].open == true` (stanowisko aktywne)
3. Slot musi zmieścić się w **obu** przedziałach czasowych

`Station.schedule` jest **źródłem prawdy** dla dostępności stanowiska. `WorkingHours` jest **zewnętrzną granicą** dla całego warsztatu — slot nigdy nie wychodzi poza godziny otwarcia warsztatu, nawet jeśli stanowisko ma szerszy grafik.

### Model Prisma

```prisma
model Station {
  id         String        @id @default(cuid())
  providerId String
  name       String        @db.VarChar(100)   // "Stanowisko 1", "Wyważarka"
  services   ServiceType[] // jakie usługi to stanowisko może wykonać
  schedule   Json          // DaySchedule[] — grafik tygodniowy (JSON)
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  provider   Provider        @relation(fields: [providerId], references: [id], onDelete: Cascade)
  workers    StationWorker[]
  bookings   Booking[]

  @@map("stations")
}

model Worker {
  id         String          @id @default(cuid())
  providerId String
  name       String          @db.VarChar(100)
  role       String?         @db.VarChar(100)
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt

  provider   Provider        @relation(fields: [providerId], references: [id], onDelete: Cascade)
  stations   StationWorker[]
  leaves     WorkerLeave[]

  @@map("workers")
}

// Tabela pośrednia Station ↔ Worker — zawiera godziny zmiany per stanowisko
model StationWorker {
  stationId  String
  workerId   String
  shiftStart String? @db.VarChar(5)  // "08:00" — null = pracuje przez cały grafik stanowiska
  shiftEnd   String? @db.VarChar(5)  // "14:00"

  station Station @relation(fields: [stationId], references: [id], onDelete: Cascade)
  worker  Worker  @relation(fields: [workerId], references: [id], onDelete: Cascade)

  @@id([stationId, workerId])
  @@index([workerId])                // wydajność: "wszystkie stanowiska pracownika X"
  @@map("station_workers")
}

model WorkerLeave {
  id        String    @id @default(cuid())
  workerId  String
  type      LeaveType
  startDate DateTime  @db.Date
  endDate   DateTime  @db.Date
  note      String?   @db.VarChar(500)
  createdAt DateTime  @default(now())

  worker Worker @relation(fields: [workerId], references: [id], onDelete: Cascade)

  @@map("worker_leaves")
}

enum LeaveType {
  VACATION
  UNPAID
  SICK
  OTHER
}
```

Typ `DaySchedule` (pole `schedule` w `Station`) to JSON array:

```ts
type DaySchedule = {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = niedziela
  open: boolean;
  startTime: string; // "08:00"
  endTime: string; // "17:00"
};
```

Pole `schedule` przechowuje pełną tablicę 7 elementów (jeden na każdy dzień tygodnia). Przy `open: false` pola `startTime`/`endTime` są ignorowane przez slot engine, ale powinny być przesyłane jako puste stringi.

### WorkerLeave — isWorkerOnLeave

`WorkersRepository` udostępnia metodę pomocniczą używaną przez slot engine:

```ts
// Zwraca true jeśli pracownik ma urlop obejmujący podany dzień
async isWorkerOnLeave(workerId: string, date: Date): Promise<boolean>
```

Metoda sprawdza tabelę `worker_leaves` pod kątem nakładania: `startDate <= date <= endDate`. Slot engine musi wywołać tę metodę dla każdego pracownika przypisanego do stanowiska przed wygenerowaniem slotu.

Reguła: jeśli wszystkie stanowiska wykonujące usługę X mają wszystkich pracowników na urlopie w danym dniu → stanowisko jest niedostępne, slot nie jest generowany.

### Slot engine — nowa logika

Algorytm wyznaczania dostępnych slotów:

```
Dla każdego kandydackiego okna [T, T + duration]:
  1. Pobierz stanowiska które (a) należą do providera i (b) mają usługę X w station.services
  2. Dla każdego stanowiska:
     a. Sprawdź grafik stanowiska (station.schedule) — czy [T, T+dur] mieści się w godzinach
     b. Znajdź pracowników przypisanych do stanowiska (StationWorker)
     c. Filtruj po shiftStart/shiftEnd — pracownik musi być dostępny przez całe [T, T+dur]
     d. Odfiltruj pracowników z urlopem (WorkerLeave) obejmującym dzień T
     e. Jeśli ≥1 pracownik dostępny → sprawdź konflikty rezerwacji (booking.stationId == station.id)
     f. Brak konfliktu → slot dostępny dla tego stanowiska
  3. Jeśli ≥1 stanowisko ma slot → okno jest dostępne
```

Urlop pracownika to **twardy blok** — slot engine pomija pracownika dla całego zakresu dat `[startDate, endDate]`. Jeśli wszystkie stanowiska wykonujące usługę X mają wszystkich pracowników na urlopie → stanowisko jest niedostępne.

**Krytyczne wymagania implementacyjne:**

| #   | Problem                                     | Wymaganie                                                                                                                                                                                               |
| --- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | Booking musi znać stanowisko                | Model `Booking` musi mieć `stationId` — bez tego slot engine nie sprawdzi kolizji per stanowisko                                                                                                        |
| T2  | Race condition przy równoległych requestach | Użyj `SELECT FOR UPDATE` na wierszu stanowiska przy tworzeniu rezerwacji (PostgreSQL advisory lock lub transakcja z lock) — `unique(startAt)` nie wystarczy dla okien nakładających się                 |
| T3  | Urlop dodany po istniejącej rezerwacji      | Przy dodawaniu `WorkerLeave` sprawdź istniejące `Booking` w zakresie dat — jeśli są i pracownik jest jedynym na stanowisku → zwróć error `WORKER_LEAVE_BOOKING_CONFLICT` z listą dotkniętych rezerwacji |
| T4  | Obsługa DST                                 | Wszystkie operacje na datach muszą używać strefy `Europe/Warsaw` przez `luxon` lub `date-fns-tz`. Nigdy nie przechowuj ani nie porównuj naiwnych `Date()` UTC dla wyznaczania slotów                    |

Stare pola `slotMinutes`, `capacityBlocks`, `CapacityBlock[]` są zastąpione przez model Stanowisk i ich grafiki.

### Ekrany B2B — ustawienia

| Plik HTML                       | URL                  | Opis                                                                              |
| ------------------------------- | -------------------- | --------------------------------------------------------------------------------- |
| `design/b2b-05-cennik.html`     | `/settings/pricing`  | Cennik — zamknięta lista 4 usług, toggle ON/OFF, warianty S/M/L, TPMS             |
| `design/b2b-06-godziny.html`    | `/settings/hours`    | Godziny otwarcia warsztatu per dzień + wyjątki/święta. Bez steppera stanowisk.    |
| `design/b2b-07-stanowiska.html` | `/settings/stations` | CRUD stanowisk, przypisanie pracowników (multi), grafik tygodniowy per stanowisko |
| `design/b2b-08-pracownicy.html` | `/settings/workers`  | CRUD pracowników, zarządzanie urlopami/nieobecnościami, timeline absencji         |

### ErrorCode — nowe kody

Dodaj do `apps/api/src/common/errors/error-code.enum.ts`:

| Kod                             | Status | Kiedy                                                                                                       |
| ------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `STATION_NOT_FOUND`             | 404    | Stanowisko nie istnieje lub nie należy do providera                                                         |
| `WORKER_NOT_FOUND`              | 404    | Pracownik nie istnieje lub nie należy do providera                                                          |
| `WORKER_LEAVE_CONFLICT`         | 409    | Daty urlopu nakładają się na istniejący urlop pracownika                                                    |
| `WORKER_LEAVE_BOOKING_CONFLICT` | 409    | Dodanie urlopu koliduje z istniejącymi rezerwacjami — odpowiedź powinna zawierać listę `affectedBookingIds` |
| `SERVICE_CONFIG_NOT_FOUND`      | 404    | Konfiguracja usługi nie istnieje                                                                            |
| `BOOKING_SLOT_UNAVAILABLE`      | 409    | Wybrany slot jest już zajęty (race condition lub nieświeży cache)                                           |
| `BOOKING_NOT_FOUND`             | 404    | Rezerwacja nie istnieje lub nie należy do klienta/providera                                                 |

---

## 22. Booking — model, state machine i flow klienta

### Model Prisma

```prisma
model Booking {
  id              String        @id @default(uuid())
  referenceCode   String        @unique @db.VarChar(10)
  clientId        String
  providerId      String
  vehicleId       String?
  pricingTierId   String?
  stationId       String?       // stanowisko obsługujące rezerwację
  status          BookingStatus @default(PENDING)
  startAt         DateTime
  endAt           DateTime
  // adres klienta (mobile provider)
  addressLine     String?
  addressCity     String?
  addressLat      Decimal?
  addressLng      Decimal?
  // snapshot wymagań klienta — immutable po stworzeniu rezerwacji
  serviceType     ServiceType?  // typ usługi: SEASONAL_SWAP | WHEEL_SWAP | BALANCING | PUNCTURE_REPAIR
  sizeTier        SizeTier?     // rozmiar: S | M | L
  tpmsRequired    Boolean       @default(false)  // czy klient wybrał obsługę TPMS
  // snapshot cen z momentu rezerwacji (immutable po created)
  tireSize        String?
  basePricePln    Decimal?
  travelFeePln    Decimal?
  totalPricePln   Decimal?
  // notatki i powody
  notes           String?
  rejectReason    String?
  cancelReason    String?
  // timestamps
  createdAt       DateTime      @default(now())
  confirmedAt     DateTime?
  startedAt       DateTime?
  completedAt     DateTime?
  cancelledAt     DateTime?

  client      User         @relation("ClientBookings", fields: [clientId], references: [id])
  provider    Provider     @relation("ProviderBookings", fields: [providerId], references: [id])
  vehicle     Vehicle?     @relation("VehicleBookings", fields: [vehicleId], references: [id])
  pricingTier PricingTier? @relation("TierBookings", fields: [pricingTierId], references: [id])
  station     Station?     @relation(fields: [stationId], references: [id])
  review      Review?

  @@index([providerId, startAt])
  @@index([clientId, startAt(sort: Desc)])
  @@map("bookings")
}
```

**Pola `serviceType`, `sizeTier`, `tpmsRequired`** są immutable po stworzeniu rezerwacji — stanowią snapshot wymagań klienta w momencie bookingu. TPMS jest dostępne tylko dla `SEASONAL_SWAP` i `WHEEL_SWAP`; backend wymusza `tpmsRequired: false` dla `BALANCING` i `PUNCTURE_REPAIR`.

`totalPricePln` jest wyliczana i blokowana przy tworzeniu rezerwacji na podstawie `ServiceConfig` / `PricingTier` providera. Nie jest przeliczana po zmianach cennika.

### State machine — BookingStatus

Aktualny enum `BookingStatus` w schemacie Prisma:

```prisma
enum BookingStatus {
  PENDING               // złożona, oczekuje na potwierdzenie przez serwis
  CONFIRMED             // serwis zatwierdził termin
  IN_PROGRESS           // zarezerwowany dla przyszłych iteracji
  COMPLETED             // wizyta zakończona
  CANCELLED_BY_CLIENT   // anulowane przez klienta
  CANCELLED_BY_PROVIDER // anulowane przez providera
  CANCELLED_BY_SYSTEM   // anulowane przez system (np. brak potwierdzenia w limicie czasu)
  NO_SHOW               // klient nie pojawił się
  REJECTED              // zarezerwowany dla przyszłych iteracji
}
```

Stany używane w sprint 1:

```
[klient tworzy] → PENDING
                      │
        ┌─────────────┼────────────────────────┐
        │             │                         │
  serwis         klient anuluje         provider anuluje
  potwierdza          │                         │
        │      CANCELLED_BY_CLIENT   CANCELLED_BY_PROVIDER
    CONFIRMED
        │
        ├─── [klient nie przyszedł] → NO_SHOW
        │
        └─── [wizyta zakończona] → COMPLETED
```

Przejścia dozwolone w sprint 1:

- `PENDING → CONFIRMED`: tylko provider (`PATCH /v1/bookings/:id/confirm`)
- `PENDING → CANCELLED_BY_CLIENT`: klient
- `PENDING → CANCELLED_BY_PROVIDER`: provider
- `CONFIRMED → CANCELLED_BY_CLIENT`: klient (≥2h przed `startAt`)
- `CONFIRMED → CANCELLED_BY_PROVIDER`: provider (zawsze)
- `CONFIRMED → NO_SHOW`: system automatycznie po `endAt` gdy klient nie pojawił się
- `CONFIRMED → COMPLETED`: system automatycznie po `endAt + buffer`

Stany `IN_PROGRESS` i `REJECTED` są zarezerwowane dla przyszłych iteracji — nie implementuj przejść do tych stanów w sprint 1.

### Flow rezerwacji klienta — 3 kroki

```
02-provider-detail  →  02b-konfiguracja  →  03-time-slot  →  04-booking-confirmed
   (wybór serwisu)      (usługa + rozmiar    (wybór terminu)    (PENDING state)
                         + TPMS + notatka)
```

| Krok | Ekran                       | Co zbiera                                                   |
| ---- | --------------------------- | ----------------------------------------------------------- |
| 1    | `02b-konfiguracja.html`     | `serviceType`, `sizeTier`, `tpmsRequired`, `note`           |
| 2    | `03-time-slot.html`         | `startAt` (slot wybrany ze slotów dostępnych dla providera) |
| 3    | `04-booking-confirmed.html` | Prezentacja stanu `PENDING` po udanym POST                  |

### Create Booking DTO

```ts
// POST /v1/bookings
class CreateBookingDto {
  @IsString() providerId: string;
  @IsEnum(ServiceType) serviceType: ServiceType;
  @IsEnum(SizeTier) sizeTier: SizeTier;
  @IsBoolean() tpmsRequired: boolean;
  @IsString() @IsOptional() note?: string;
  @IsDateString() startAt: string; // ISO 8601 — backend konwertuje do UTC
}
```

Backend wybiera stanowisko automatycznie (slot engine) — klient nie wskazuje `stationId`. Cena jest wyliczana z `ServiceConfig` providera i zwracana w response jako `totalPricePln`.

### TPMS — logika warunkowa po stronie klienta

TPMS pytanie pokazuj tylko dla usług `SEASONAL_SWAP` i `WHEEL_SWAP`. Dla `BALANCING` i `PUNCTURE_REPAIR` — ukryj sekcję i wyślij `tpmsRequired: false`.

```ts
const showTpms = ['SEASONAL_SWAP', 'WHEEL_SWAP'].includes(selectedService);
```

### Size selector — logika warunkowa

Size selector (S/M/L) ukryj dla `PUNCTURE_REPAIR` — usługa ma cenę ryczałtową niezależną od rozmiaru. Wyślij `sizeTier: 'S'` jako placeholder.

### Cena — obliczanie w kliencie (podgląd)

```ts
// ServiceConfig zwrócony z GET /v1/providers/:id — tylko enabled=true
function previewPrice(config: ServiceConfig, tier: SizeTier, tpms: boolean): number {
  const base = tier === 'S' ? config.priceSPln : tier === 'M' ? config.priceMPln : config.priceLPln;
  const tpmsExtra = tpms && config.tpmsEnabled ? (config.tpmsPricePln ?? 0) * 4 : 0;
  return (base ?? 0) + tpmsExtra;
}
```

Cena w UI to **szacunek** (oznaczony "(szacunek)") — ostateczna cena potwierdzona jest po stronie backendu przy `POST /v1/bookings`.
