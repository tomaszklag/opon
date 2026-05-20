export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API error ${status}`);
    this.name = 'ApiError';
  }

  isUnauthorized() {
    return this.status === 401;
  }
  isNotFound() {
    return this.status === 404;
  }
  isConflict() {
    return this.status === 409;
  }
  isValidation() {
    return this.status === 422;
  }

  getCode(): string | undefined {
    if (typeof this.body === 'object' && this.body !== null && 'code' in this.body) {
      return (this.body as { code: string }).code;
    }
    return undefined;
  }

  getMessage(): string {
    if (typeof this.body === 'object' && this.body !== null && 'message' in this.body) {
      return String((this.body as { message: string }).message);
    }
    return 'Wystąpił błąd. Spróbuj ponownie.';
  }
}
