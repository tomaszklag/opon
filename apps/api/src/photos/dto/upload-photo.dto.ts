import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PhotoType {
  LOGO = 'LOGO',
  VEHICLE = 'VEHICLE',
  WORKSPACE = 'WORKSPACE',
  ADDITIONAL = 'ADDITIONAL',
}

export class UploadPhotoDto {
  @ApiProperty({ enum: PhotoType })
  @IsEnum(PhotoType)
  type!: PhotoType;
}
