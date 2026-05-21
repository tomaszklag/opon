import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepotSlotResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() section!: string;
  @ApiProperty() row!: number;
  @ApiProperty() position!: number;
  @ApiPropertyOptional({ type: String, nullable: true }) label!: string | null;
  @ApiProperty() occupied!: boolean;
  @ApiPropertyOptional({ type: String, nullable: true }) tireSetId!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) tireSetClientName!: string | null;
}
