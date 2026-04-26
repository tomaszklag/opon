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

2. Strona Next.js
   └─ apps/panel/app/dashboard/<modul>/page.tsx
   └─ apps/panel/app/dashboard/<modul>/<modul>.module.css

3. Zweryfikuj TypeScript
   └─ cd apps/panel && npx tsc --noEmit
```

Design reference dla każdego ekranu panelu: `design/b2b-*.html`. Mapa ekran ↔ task w `plan-sprintow.md §12.Z`.

---

## 7. Linting i formatowanie

```bash
pnpm lint            # ESLint na całym monorepo (auto-fix)
pnpm type-check      # tsc --noEmit na wszystkich aplikacjach
```

Husky uruchamia lint-staged automatycznie przy `git commit`:

- `**/*.{ts,tsx,js,jsx}` → `eslint --fix` + `prettier --write`
- `**/*.{json,md,yaml,yml}` → `prettier --write`

Jeśli commit się nie udaje przez hook — nie używaj `--no-verify`. Napraw problem i spróbuj ponownie.

---

## 8. Testowanie

```bash
pnpm test            # Vitest — unit + integration (wszystkie apps)
pnpm test:e2e        # Playwright — E2E (wymaga działającego dev env)

# Tylko jeden pakiet
pnpm --filter api test
pnpm --filter @opony/panel test
```

MSW mockuje API w testach FE i w dev (`NEXT_PUBLIC_API_MOCK=true`). Handlery: `apps/panel/mocks/handlers/`.

---

## 9. Przydatne one-linery

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
