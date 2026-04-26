import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WorkingHoursResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiProperty({ type: Number }) dayOfWeek!: number;
  @ApiProperty() isClosed!: boolean;
  @ApiPropertyOptional({ type: String, nullable: true }) openTime?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) closeTime?: string | null;
  @ApiProperty({ type: Number }) slotMinutes!: number;
}
