import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoragePeriodResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() storedAt!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) releaseDue!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) pickedUpAt!: string | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) pricePln!: number | null;
  @ApiPropertyOptional({ type: String, nullable: true }) notes!: string | null;
}
