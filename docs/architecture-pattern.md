# Wzorzec architektury API — Pragmatic Clean Architecture

> **Obowiązuje dla wszystkich modułów NestJS w `apps/api`.  
> Każda nowa implementacja MUSI respektować ten wzorzec.**

---

## Uzasadnienie wyboru

Projekt używa **Pragmatic Clean Architecture** — uproszczonej wersji Clean Architecture
dopasowanej do NestJS + Prisma + małego zespołu. Daje 80% korzyści pełnego CA
(testowalność, rozdzielenie odpowiedzialności, czytelność) przy 20% narzutu.

Rezygnujemy z:

- Interfejsów repozytorium (Prisma nie wymaga mockowania przy integration tests)
- Domain entities oddzielonych od Prisma typów (Prisma model = entity w tym projekcie)
- Application DTOs oddzielonych od Prisma (Prisma typy są typebezpieczne i wystarczające)

Zachowujemy:

- Ścisły podział warstw z jednym kierunkiem zależności
- Repository pattern jako granicę między logiką a bazą danych
- Use-case semantykę w serwisach

---

## Struktura modułu

```
src/
  [nazwa-modułu]/
    dto/
      create-[entity].dto.ts      ← input validation (class-validator)
      update-[entity].dto.ts      ← partial update input
      list-[entity]-query.dto.ts  ← query params dla listowania
    [nazwa-modułu].repository.ts  ← WARSTWA INFRASTRUKTURY
    [nazwa-modułu].service.ts     ← WARSTWA APLIKACJI
    [nazwa-modułu].controller.ts  ← WARSTWA PREZENTACJI
    [nazwa-modułu].module.ts
```

Przykład referencyjny: `src/providers/`

---

## Warstwy i ich odpowiedzialności

### 1. WARSTWA PREZENTACJI — `*.controller.ts`

**Co robi:**

- Odbiera żądania HTTP, parsuje parametry, wywołuje serwis, zwraca odpowiedź
- Stosuje dekoratory walidacji (`@Body()`, `@Param(ParseUUIDPipe)`, `@Query()`)
- Deklaruje Swagger (`@ApiOperation`, `@ApiResponse`, `@ApiTags`)
- Używa `@CurrentUser()` do wyciągania danych z JWT

**Czego NIE robi:**

- Nie zawiera logiki biznesowej
- Nie dotyka Prismy ani bazy danych
- Nie wykonuje walidacji domenowej (to zadanie serwisu)
- Nie buduje złożonych zapytań

```typescript
// ✅ DOBRZE
@Post()
create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProviderDto) {
  return this.service.create(user.sub, dto);
}

// ❌ ŹLE — logika biznesowa w kontrolerze
@Post()
async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateProviderDto) {
  const existing = await this.prisma.provider.findUnique(...); // NIGDY
  if (existing) throw new ConflictException();
  return this.prisma.provider.create(...);
}
```

---

### 2. WARSTWA APLIKACJI — `*.service.ts`

**Co robi:**

- Implementuje logikę biznesową i reguły domenowe
- Orkiestruje wywołania repozytorium
- Rzuca wyjątki HTTP (`NotFoundException`, `ConflictException`, `ForbiddenException`)
- Łączy operacje z wielu repozytoriów (bez własnego Prisma, chyba że cross-entity transakcja)
- Definiuje typy wynikowe operacji (np. `ProviderPage`)

**Czego NIE robi:**

- Nie używa `Request`, `Response`, dekoratorów HTTP
- Nie buduje zapytań Prisma (SELECT \* WHERE ...)
- Nie zwraca statusów HTTP — rzuca wyjątki, NestJS obsługuje konwersję

```typescript
// ✅ DOBRZE
async create(ownerId: string, dto: CreateProviderDto): Promise<Provider> {
  const existing = await this.repo.findByOwnerId(ownerId);
  if (existing) throw new ConflictException('Masz już zarejestrowaną firmę.');
  return this.repo.createWithOwnerPromotion(ownerId, dto);
}

// ❌ ŹLE — HTTP status w serwisie
async create(ownerId: string, dto: CreateProviderDto) {
  // ...
  return { statusCode: 201, data: provider }; // NIGDY
}
```

---

### 3. WARSTWA INFRASTRUKTURY — `*.repository.ts`

**Co robi:**

- Enkapsuluje wszystkie operacje Prisma dla danego modułu
- Definiuje zapytania (filtry, sortowanie, paginację)
- Zarządza transakcjami dla operacji wieloencjowych w obrębie modułu
- Zwraca typy Prisma (`Provider`, `User`, etc.)

**Czego NIE robi:**

- Nie zawiera logiki biznesowej (np. nie sprawdza czy user ma uprawnienia)
- Nie rzuca wyjątków HTTP (`NotFoundException` etc.) — zwraca `null` gdy nie znaleziono
- Nie komunikuje się z zewnętrznymi API

```typescript
// ✅ DOBRZE — zwraca null gdy nie znaleziono
findById(id: string): Promise<Provider | null> {
  return this.prisma.provider.findUnique({ where: { id } });
}

// ❌ ŹLE — logika i HTTP exception w repozytorium
async findById(id: string): Promise<Provider> {
  const provider = await this.prisma.provider.findUnique({ where: { id } });
  if (!provider) throw new NotFoundException('Firma nie istnieje.'); // NIGDY
  return provider;
}
```

---

### 4. DTOs — `dto/*.dto.ts`

**Input DTOs** (`create-*.dto.ts`, `update-*.dto.ts`, `*-query.dto.ts`):

- Dekoratory `class-validator` do walidacji
- Dekoratory `@ApiProperty` do Swagger
- Pole opcjonalne = `@IsOptional()` + typ `?: string`
- Pole wymagane = `!: string` (definite assignment)

**Brak osobnych Response DTOs** — serwis zwraca typy Prisma lub Omit<> z nich.

**Pola sensitywne** (IBAN, hasła, tokeny) MUSZĄ być wykluczone z publicznych endpointów.
Używaj prostego destructuring w serwisie — bez ClassSerializerInterceptor:

```typescript
// service.ts — widok publiczny bez danych finansowych
export type ProviderPublicView = Omit<Provider, 'bankAccountIban'>;

private toPublicView(provider: Provider): ProviderPublicView {
  const { bankAccountIban, ...publicView } = provider;
  return publicView;
}
```

Metody publiczne zwracają `ProviderPublicView`, metody właściciela zwracają pełny `Provider`.

---

## Przepływ danych (kierunek zależności)

```
HTTP Request
    ↓
Controller          ← zna DTO + JwtPayload
    ↓
Service             ← zna DTO + domain types (Prisma)
    ↓
Repository          ← zna Prisma types + PrismaService
    ↓
PrismaService → PostgreSQL
```

**Zależność idzie TYLKO w dół. Repozytorium NIE zna serwisu. Serwis NIE zna kontrolera.**

---

## Transakcje

| Zakres                         | Gdzie                                                           |
| ------------------------------ | --------------------------------------------------------------- |
| Jedna encja                    | `repository.ts` — `this.prisma.[model].*`                       |
| Wiele encji tego samego modułu | `repository.ts` — `this.prisma.$transaction(async tx => {...})` |
| Wiele modułów (saga)           | `service.ts` z injektowanymi repozytoriami obu modułów          |

Zawsze używaj **interactive transaction** (`async tx => {...}`), nie array mode (`[op1, op2]`).

---

## Konwencje nazewnicze

| Element                     | Konwencja                                | Przykład                        |
| --------------------------- | ---------------------------------------- | ------------------------------- |
| Metoda repo — odczyt        | `findBy[Pole]`                           | `findByOwnerId`                 |
| Metoda repo — zapis atomowy | `createWith[CoRobi]`                     | `createWithOwnerPromotion`      |
| Metoda serwisu — publiczna  | rzeczownik/czasownik                     | `getMyProvider`, `listApproved` |
| DTO input                   | `Create[Entity]Dto`, `Update[Entity]Dto` | `CreateProviderDto`             |
| DTO query                   | `List[Entity]QueryDto`                   | `ListProvidersQueryDto`         |
| Typ strony                  | `[Entity]Page`                           | `ProviderPage`                  |

---

## Checklist przy nowym module

**Architektura:**

- [ ] Controller **nie importuje** `PrismaService`
- [ ] Service **nie importuje** `PrismaService` (wyjątek: cross-module saga)
- [ ] Repository zwraca `null` zamiast rzucać `NotFoundException`
- [ ] Transakcje używają interactive mode (`async tx =>`)
- [ ] Module deklaruje `exports: [Service]` jeśli inne moduły mogą potrzebować

**DTOs i walidacja:**

- [ ] Pola wymagane mają `!:` i brak `@IsOptional()`
- [ ] Pola opcjonalne mają `?:` + `@IsOptional()`
- [ ] Pola tekstowe mają `@MaxLength()` (zapobiega DoS)
- [ ] UUID params w kontrolerze mają `ParseUUIDPipe`
- [ ] Enum params mają `@IsEnum()`

**Bezpieczeństwo:**

- [ ] Pola sensitywne (IBAN, tokeny, hasła) wykluczone z publicznych odpowiedzi
- [ ] Błędy Prisma `P2025` obsługiwane jako `NotFoundException` w serwisie
- [ ] Publiczne endpointy (`@Public()`) nie zwracają danych dostępnych tylko dla właściciela
- [ ] `NotFoundException` zamiast `ForbiddenException` gdy nie chcemy ujawniać istnienia zasobu

**Finalnie:**

- [ ] TypeScript check: `npx tsc --noEmit` → 0 błędów

---

## Moduły referencyjne

| Moduł            | Opis                                                            |
| ---------------- | --------------------------------------------------------------- |
| `src/auth/`      | Autentykacja — OTP + JWT + sesje (starszy styl, service-heavy)  |
| `src/providers/` | **Wzorcowy przykład** Pragmatic CA — 3 warstwy, pełna struktura |
