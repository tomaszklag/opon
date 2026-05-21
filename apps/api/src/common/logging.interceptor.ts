import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, path } = req;
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse<Response>();
          const ms = Date.now() - start;
          console.info(`[HTTP] ${method} ${path} ${res.statusCode} +${ms}ms`);
        },
        error: (err: { status?: number }) => {
          const ms = Date.now() - start;
          console.info(`[HTTP] ${method} ${path} ${err.status ?? 500} +${ms}ms`);
        },
      }),
    );
  }
}
