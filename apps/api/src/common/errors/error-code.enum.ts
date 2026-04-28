export enum ErrorCode {
  // ── AUTH ──────────────────────────────────────────────────────────────────
  /** Użytkownik nie istnieje */
  AUTH_USER_NOT_FOUND = 'AUTH_USER_NOT_FOUND',
  /** Konto zostało usunięte */
  AUTH_ACCOUNT_DELETED = 'AUTH_ACCOUNT_DELETED',
  /** Konto zablokowane */
  AUTH_ACCOUNT_BANNED = 'AUTH_ACCOUNT_BANNED',
  /** Nieprawidłowy lub wygasły refresh token */
  AUTH_INVALID_REFRESH_TOKEN = 'AUTH_INVALID_REFRESH_TOKEN',
  /** Sesja nie istnieje */
  AUTH_SESSION_NOT_FOUND = 'AUTH_SESSION_NOT_FOUND',
  /** Sesja wygasła */
  AUTH_SESSION_EXPIRED = 'AUTH_SESSION_EXPIRED',
  /** Wykryto ponowne użycie tokenu */
  AUTH_TOKEN_REUSE_DETECTED = 'AUTH_TOKEN_REUSE_DETECTED',
  /** Wykryto podejrzaną aktywność (hash mismatch) */
  AUTH_SUSPICIOUS_ACTIVITY = 'AUTH_SUSPICIOUS_ACTIVITY',
  /** Brak lub nieprawidłowy token autoryzacji */
  AUTH_UNAUTHORIZED = 'AUTH_UNAUTHORIZED',
  /** Brak wystarczających uprawnień */
  AUTH_FORBIDDEN = 'AUTH_FORBIDDEN',

  // ── OTP ───────────────────────────────────────────────────────────────────
  /** Zbyt wiele prób wysłania OTP */
  OTP_RATE_LIMIT_EXCEEDED = 'OTP_RATE_LIMIT_EXCEEDED',
  /** Nieprawidłowy lub wygasły kod OTP */
  OTP_INVALID_OR_EXPIRED = 'OTP_INVALID_OR_EXPIRED',

  // ── PROVIDER ──────────────────────────────────────────────────────────────
  /** Użytkownik ma już zarejestrowaną firmę */
  PROVIDER_ALREADY_EXISTS = 'PROVIDER_ALREADY_EXISTS',
  /** Podany NIP jest już zarejestrowany w systemie */
  PROVIDER_NIP_CONFLICT = 'PROVIDER_NIP_CONFLICT',
  /** Firma nie istnieje */
  PROVIDER_NOT_FOUND = 'PROVIDER_NOT_FOUND',
  /** Użytkownik nie ma zarejestrowanej firmy */
  PROVIDER_OWNER_NOT_FOUND = 'PROVIDER_OWNER_NOT_FOUND',
  /** Firma nie jest w oczekiwanym stanie (np. nie PENDING_DOCS) */
  PROVIDER_INVALID_STATUS = 'PROVIDER_INVALID_STATUS',
  /** Firma nie jest w stanie oczekującym na weryfikację (admin) */
  PROVIDER_NOT_PENDING_APPROVAL = 'PROVIDER_NOT_PENDING_APPROVAL',
  /** Nie udało się zarejestrować firmy — błąd wewnętrzny */
  PROVIDER_CREATE_FAILED = 'PROVIDER_CREATE_FAILED',

  // ── GUS / CEIDG ───────────────────────────────────────────────────────────
  /** NIP nie znaleziony w CEIDG */
  GUS_NIP_NOT_FOUND = 'GUS_NIP_NOT_FOUND',
  /** Nieprawidłowy numer NIP */
  GUS_INVALID_NIP = 'GUS_INVALID_NIP',
  /** Błąd połączenia z CEIDG */
  GUS_CONNECTION_ERROR = 'GUS_CONNECTION_ERROR',
  /** Inny błąd zapytania do CEIDG */
  GUS_REQUEST_ERROR = 'GUS_REQUEST_ERROR',

  // ── PHOTO ─────────────────────────────────────────────────────────────────
  /** Przekroczono limit zdjęć dodatkowych */
  PHOTO_ADDITIONAL_LIMIT_EXCEEDED = 'PHOTO_ADDITIONAL_LIMIT_EXCEEDED',
  /** Zdjęcie nie istnieje */
  PHOTO_NOT_FOUND = 'PHOTO_NOT_FOUND',
  /** Brak dostępu do zdjęcia */
  PHOTO_ACCESS_DENIED = 'PHOTO_ACCESS_DENIED',

  // ── PRICING TIER ──────────────────────────────────────────────────────────
  /** Tier cenowy nie istnieje */
  PRICING_TIER_NOT_FOUND = 'PRICING_TIER_NOT_FOUND',
  /** Brak dostępu do tieru cenowego */
  PRICING_TIER_ACCESS_DENIED = 'PRICING_TIER_ACCESS_DENIED',
  /** rimSizeMin musi być ≤ rimSizeMax */
  PRICING_TIER_INVALID_RIM_RANGE = 'PRICING_TIER_INVALID_RIM_RANGE',
  /** Przedział felg już istnieje */
  PRICING_TIER_RANGE_CONFLICT = 'PRICING_TIER_RANGE_CONFLICT',

  // ── WORKING HOURS ─────────────────────────────────────────────────────────
  /** Brak openTime/closeTime dla dnia otwartego */
  WORKING_HOURS_MISSING_TIMES = 'WORKING_HOURS_MISSING_TIMES',
  /** openTime musi być wcześniejsza niż closeTime */
  WORKING_HOURS_INVALID_TIME_RANGE = 'WORKING_HOURS_INVALID_TIME_RANGE',

  // ── VALIDATION ────────────────────────────────────────────────────────────
  /** Ogólny błąd walidacji danych wejściowych */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Zasób nie znaleziony */
  NOT_FOUND = 'NOT_FOUND',

  // ── INTERNAL ──────────────────────────────────────────────────────────────
  /** Wewnętrzny błąd serwera */
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
