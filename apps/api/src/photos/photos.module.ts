import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { PhotosController } from './photos.controller';
import { PhotosRepository } from './photos.repository';
import { PhotosService } from './photos.service';

@Module({
  imports: [ProvidersModule],
  controllers: [PhotosController],
  providers: [PhotosService, PhotosRepository],
  exports: [PhotosService],
})
export class PhotosModule {}
