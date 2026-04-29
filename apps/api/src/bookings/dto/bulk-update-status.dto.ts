import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsString } from 'class-validator';

export class BulkUpdateStatusDto {
  @ApiProperty({ type: [String] }) @IsArray() @IsString({ each: true }) ids!: string[];
  @ApiProperty() @IsIn(['confirm', 'cancel']) action!: 'confirm' | 'cancel';
}
