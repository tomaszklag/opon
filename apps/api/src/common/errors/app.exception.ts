import { HttpException } from '@nestjs/common';
import { ErrorCode } from './error-code.enum';

export class AppException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    statusCode: number,
  ) {
    super({ code, message, statusCode }, statusCode);
  }
}
