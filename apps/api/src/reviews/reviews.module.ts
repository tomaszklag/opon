import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsRepository } from './reviews.repository';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [ProvidersModule],
  controllers: [ReviewsController],
  providers: [ReviewsRepository, ReviewsService],
})
export class ReviewsModule {}
