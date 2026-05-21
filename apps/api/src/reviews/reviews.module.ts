import { forwardRef, Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { ReviewsAppController } from './reviews-app.controller';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [forwardRef(() => ProvidersModule)],
  controllers: [ReviewsController, ReviewsAppController],
  providers: [ReviewsRepository, ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
