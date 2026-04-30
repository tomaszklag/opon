import { Controller, ForbiddenException, Header, Res, Sse, MessageEvent } from '@nestjs/common';
import { Response } from 'express';
import { Observable, merge, interval } from 'rxjs';
import { map, finalize } from 'rxjs/operators';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { RealtimeService } from './realtime.service';

@Controller('v1/providers/me/realtime')
export class RealtimeController {
  constructor(private readonly realtimeService: RealtimeService) {}

  @Sse('events')
  @Header('X-Accel-Buffering', 'no')
  onConnect(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Observable<MessageEvent> {
    if (!user.providerId) {
      throw new ForbiddenException('Brak dostępu do SSE — wymagane konto warsztatu.');
    }

    const providerId = user.providerId;
    const subject = this.realtimeService.getOrCreate(providerId);

    res.on('close', () => {
      this.realtimeService.release(providerId);
    });

    const heartbeat$ = interval(25_000).pipe(
      map(
        () =>
          ({
            data: JSON.stringify({ type: 'ping', ts: new Date().toISOString() }),
          }) as MessageEvent,
      ),
    );

    return merge(subject.asObservable(), heartbeat$).pipe(
      finalize(() => this.realtimeService.release(providerId)),
    );
  }
}
