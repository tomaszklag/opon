# Uwierzytelnianie — sesje i rotacja tokenów

## Architektura

Aplikacja używa **dwóch tokenów JWT** przechowywanych w HttpOnly cookies:

| Token           | TTL    | Cookie path        | Cel                                     |
| --------------- | ------ | ------------------ | --------------------------------------- |
| `access_token`  | 15 min | `/`                | Autoryzacja każdego żądania (stateless) |
| `refresh_token` | 30 dni | `/v1/auth/refresh` | Wymiana na nową parę tokenów            |

Oba tokeny zawierają claim `jti` (JWT ID) = `session.id` z tabeli `sessions`.

---

## Tabela `sessions`

```sql
sessions (
  id          UUID PRIMARY KEY,   -- = jti w obu tokenach
  user_id     UUID NOT NULL,
  token_hash  VARCHAR(64) UNIQUE, -- SHA-256(refreshToken) hex — nigdy plaintext
  user_agent  VARCHAR(500),
  ip_address  VARCHAR(45),
  created_at  TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  revoked_at  TIMESTAMPTZ         -- NULL = aktywna, NOT NULL = unieważniona
)
```

Wiersze z `revoked_at IS NOT NULL` można usuwać po `expires_at` (job w Sprint 2).

---

## Przepływ

### Logowanie (`POST /v1/auth/verify-otp`)

```
1. Weryfikacja OTP
2. Szuka lub tworzy użytkownika
3. jti = randomUUID()
4. Podpisuje access_token + refresh_token z { ...payload, jti }
5. Tworzy wiersz w sessions: { id: jti, tokenHash: SHA256(refreshToken), ... }
6. Ustawia oba cookies
```

### Odświeżanie tokenów (`POST /v1/auth/refresh`)

```
1. Weryfikuje podpis refresh_token (JWT) → odrzuca wygasłe
2. Wyciąga jti z payload
3. Pobiera session WHERE id = jti
   ├─ Brak sesji → 401
   ├─ revokedAt IS NOT NULL → TOKEN REUSE DETECTED
   │   └─ Unieważnia WSZYSTKIE aktywne sesje użytkownika → 401
   └─ SHA256(incoming) ≠ tokenHash → jak wyżej → 401
4. Sprawdza czy użytkownik nadal istnieje i nie jest zbanowany
5. newJti = randomUUID()
6. Generuje nową parę tokenów z newJti
7. Transakcja: revoke old session + create new session
8. Ustawia nowe cookies
```

### Wylogowanie (`POST /v1/auth/logout`)

```
1. Wyciąga jti z access_token (już zweryfikowanego przez JwtAuthGuard)
2. Ustawia revokedAt = NOW() na tej sesji
3. Czyści oba cookies po stronie klienta
```

Po wylogowaniu: `access_token` pozostaje poprawnym JWT przez max 15 min,
ale sesja jest odwołana → kolejne `/refresh` zakończy się 401.
Efektywny czas wylogowania: ≤ 15 min.

---

## Detekcja kradzieży tokenu (token reuse detection)

Refresh token rotation gwarantuje, że każdy token może być użyty **dokładnie raz**.

**Scenariusz ataku:**

1. Atakujący kradnie refresh token użytkownika (np. przez MITM lub XSS)
2. Legitymowy użytkownik odświeża tokeny → stara sesja oznaczona `revokedAt`
3. Atakujący próbuje użyć skradzionego tokenu → sesja już odwołana
4. System wykrywa reuse → **unieważnia WSZYSTKIE aktywne sesje** tego użytkownika
5. Obaj (user i atakujący) muszą zalogować się ponownie

Jeśli atakujący zdąży odświeżyć pierwszy (krok 2 i 3 zamienione):

1. Atakujący odświeża → nowa sesja dla atakującego
2. Użytkownik próbuje odświeżyć starym tokenem → sesja już odwołana
3. System unieważnia wszystkie sesje → atakujący też traci dostęp

W obu przypadkach **kompromitacja jest wykryta i izolowana**.

---

## Bezpieczeństwo cookies

| Atrybut          | Dev                | Prod               |
| ---------------- | ------------------ | ------------------ |
| `HttpOnly`       | ✅                 | ✅                 |
| `Secure`         | ❌ (HTTP)          | ✅ (HTTPS)         |
| `SameSite`       | `Lax`              | `Lax`              |
| `Domain`         | brak               | `.opony.app`       |
| `Path` (refresh) | `/v1/auth/refresh` | `/v1/auth/refresh` |

`SameSite=Lax` + `Domain=.opony.app` umożliwia wysyłanie cookies między
`panel.opony.app` → `api.opony.app` (same-site, różne subdomeny).

---

## Plany Sprint 2

- `GET /v1/auth/sessions` — lista aktywnych sesji użytkownika (urządzenie, IP, data)
- `DELETE /v1/auth/sessions/:id` — wylogowanie z konkretnego urządzenia
- `DELETE /v1/auth/sessions` — wylogowanie ze wszystkich urządzeń
- Cron job czyszczący wygasłe/odwołane sesje starsze niż 90 dni
