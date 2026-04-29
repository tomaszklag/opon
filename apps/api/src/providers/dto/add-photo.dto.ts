import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PhotoType } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class AddPhotoDto {
  @ApiProperty() @IsString() @IsUrl() @MaxLength(500) url!: string;
  @ApiPropertyOptional({ enum: PhotoType })
  @IsOptional()
  @IsEnum(PhotoType)
  type?: PhotoType;
}
