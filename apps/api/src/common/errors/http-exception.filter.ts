import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppException } from './app.exception';
import { ErrorCode } from './error-code.enum';

interface ErrorResponse {
  code: string;
  message: string;
  statusCode: number;
}

function httpStatusToCode(status: number): ErrorCode {
  switch (status) {
    case HttpStatus.UNAUTHORIZED:
      return ErrorCode.AUTH_UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return ErrorCode.AUTH_FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return ErrorCode.NOT_FOUND;
    case HttpStatus.BAD_REQUEST:
    case HttpStatus.UNPROCESSABLE_ENTITY:
      return ErrorCode.VALIDATION_ERROR;
    default:
      return ErrorCode.INTERNAL_ERROR;
  }
}

function extractMessage(response: string | object): string {
  if (typeof response === 'string') return response;

  const r = response as Record<string, unknown>;

  // class-validator pipe wraps errors in `message` array
  if (Array.isArray(r['message'])) {
    return (r['message'] as string[]).join('; ');
  }

  if (typeof r['message'] === 'string') return r['message'];

  return 'Błąd żądania';
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let body: ErrorResponse;

    if (exception instanceof AppException) {
      const status = exception.getStatus();
      body = {
        code: exception.code,
        message: exception.message,
        statusCode: status,
      };
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      body = {
        code: httpStatusToCode(status),
        message: extractMessage(response),
        statusCode: status,
      };
    } else {
      const message = exception instanceof Error ? exception.message : 'Błąd serwera';

      this.logger.error(
        `Unhandled exception [${req.method} ${req.url}]: ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
      );

      body = {
        code: ErrorCode.INTERNAL_ERROR,
        message: 'Błąd serwera',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }

    if (body.statusCode >= 500) {
      this.logger.error(
        `[${body.statusCode}] ${body.code} — ${req.method} ${req.url} — ${body.message}`,
      );
    }

    res.status(body.statusCode).json(body);
  }
}
