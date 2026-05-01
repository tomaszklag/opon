import { ApiProperty } from '@nestjs/swagger';
import { PhotoType } from './upload-photo.dto';

export class PhotoResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() url!: string;
  @ApiProperty({ enum: PhotoType }) type!: string;
  @ApiProperty() isPrimary!: boolean;
  @ApiProperty() size!: number;
  @ApiProperty() mimeType!: string;
  @ApiProperty() originalName!: string;
  @ApiProperty() createdAt!: Date;
}
