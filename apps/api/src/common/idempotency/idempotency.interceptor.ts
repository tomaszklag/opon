import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, of, switchMap } from 'rxjs';
import type { Request, Response } from 'express';
import { AppException, ErrorCode } from '../errors';
import { IdempotencyService } from './idempotency.service';
import type { JwtPayload } from '../../auth/types/jwt-payload.interface';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly idempotency: IdempotencyService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: JwtPayload }>();

    const rawKey = req.headers['x-idempotency-key'] as string | undefined;
    if (!rawKey) return next.handle();

    if (rawKey.length > 128) {
      throw new AppException(
        ErrorCode.VALIDATION_ERROR,
        'X-Idempotency-Key nie może przekraczać 128 znaków.',
        422,
      );
    }

    const userId = req.user?.sub ?? 'anonymous';
    const scopedKey = `${userId}:${rawKey}`;
    const payloadHash = IdempotencyService.hashPayload(req.body);

    const existing = await this.idempotency.find(scopedKey);

    if (existing) {
      if (existing.payloadHash !== payloadHash) {
        throw new AppException(
          ErrorCode.IDEMPOTENCY_CONFLICT,
          'Ten klucz idempotentności został już użyty z innym żądaniem.',
          422,
        );
      }
      // Return cached response with original status code
      const res = http.getResponse<Response>();
      res.status(existing.statusCode);
      return of(existing.response);
    }

    return next.handle().pipe(
      switchMap(async (data: unknown) => {
        const res = http.getResponse<Response>();
        await this.idempotency.store(scopedKey, payloadHash, res.statusCode, data);
        return data;
      }),
    );
  }
}
