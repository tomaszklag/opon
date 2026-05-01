import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class RenamePhotoDto {
  @ApiProperty({ example: 'Logo warsztatu' })
  @IsString()
  @Length(1, 255)
  name!: string;
}
