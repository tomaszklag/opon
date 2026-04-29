import { ApiProperty } from '@nestjs/swagger';
import { PhotoType } from '@prisma/client';

export class PhotoResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiProperty() url!: string;
  @ApiProperty({ enum: PhotoType }) type!: PhotoType;
  @ApiProperty() isPrimary!: boolean;
  @ApiProperty() createdAt!: Date;
}
