import { forwardRef, Module } from '@nestjs/common';
import { BookingsModule } from '../bookings/bookings.module';
import { ReviewsModule } from '../reviews/reviews.module';
import { ProvidersAppController } from './providers-app.controller';
import { ProvidersController } from './providers.controller';
import { ProvidersRepository } from './providers.repository';
import { ProvidersService } from './providers.service';

@Module({
  imports: [forwardRef(() => BookingsModule), forwardRef(() => ReviewsModule)],
  controllers: [ProvidersController, ProvidersAppController],
  providers: [ProvidersService, ProvidersRepository],
  exports: [ProvidersService],
})
export class ProvidersModule {}
