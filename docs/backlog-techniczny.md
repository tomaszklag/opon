# Backlog techniczny — Opony.app

Wymagania i usprawnienia odłożone świadomie na przyszłość. Każdy wpis zawiera kontekst decyzji i wskazówkę implementacyjną.

---

## Sesje użytkownika

### [TECH-01] Geolokalizacja IP w aktywnych sesjach

**Kontekst:** Panel wyświetla listę aktywnych sesji (`GET /v1/auth/sessions`). Aktualnie pokazujemy tylko zamaskowany adres IP (`185.254.xxx.xxx`). Design (`design/b2b-14-ustawienia.html`) zakłada wyświetlanie nazwy miasta obok IP — np. `Kraków · 31.0.xxx.xxx`.

**Co brakuje:**

- Model `Session` nie ma pola `city` (ani żadnych danych geolokalizacyjnych).
- Frontend maskuje ostatni oktet IP, ale nie zna miasta.

**Proponowana implementacja:**

1. Dodaj pole `city String?` do modelu `Session` w `apps/api/prisma/schema.prisma`.
2. Stwórz migrację (`prisma migrate dev`).
3. W `AuthService.createSession` i `rotateSession` wywołaj geolokalizację po IP i zapisz miasto.
4. Serwis geolokalizacji: [`ip-api.com`](http://ip-api.com/json/{ip}?fields=city&lang=pl) — darmowy do ~1000 req/min, bez klucza. Wywołanie fire-and-forget (nie blokuje logowania przy timeout).
5. Dodaj `city` do `SessionResponseDto` i `SessionDto` w schema.d.ts.
6. Frontend: wyświetl `{city} · {maskedIp}` gdy `city` jest dostępne, samo IP gdy nie.

**Uwagi:**

- IPv6 (`::1`, `::ffff:...`) w środowisku lokalnym — geolokalizacja nie zadziała, obsłuż jako `null`.
- Nie przechowywać pełnego IP w polu `city` — tylko nazwę miasta.
- Adresy prywatne (`127.x`, `10.x`, `192.168.x`, `::1`) → pomiń zapytanie, zapisz `null`.

**Pliki do zmiany:**

- `apps/api/prisma/schema.prisma` — `+city String?` na modelu `Session`
- `apps/api/src/auth/auth.service.ts` — geolokalizacja w `createSession` + `rotateSession`
- `apps/api/src/auth/auth.repository.ts` — przekaż `city` do `createSession` i nowego session w `rotateSession`
- `apps/api/src/auth/dto/session-response.dto.ts` — `+city?: string | null`
- `packages/api-client/src/schema.d.ts` — `+city?: string | null` w `SessionDto`
- `apps/panel/app/dashboard/settings/page.tsx` — wyświetl `{city} · {maskedIp}` lub samo IP
