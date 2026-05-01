import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CapacityBlockResponseDto {
  @ApiProperty({ example: '08:00' }) from!: string;
  @ApiProperty({ example: '13:00' }) to!: string;
  @ApiProperty({ type: Number, example: 2 }) workstations!: number;
}

export class WorkingHoursResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiProperty({ type: Number }) dayOfWeek!: number;
  @ApiProperty() isClosed!: boolean;
  @ApiPropertyOptional({ type: String, nullable: true }) openTime?: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) closeTime?: string | null;
  @ApiProperty({ type: Number }) slotMinutes!: number;
  @ApiProperty({ type: Number, default: 1 }) workstations!: number;
  @ApiPropertyOptional({ type: [CapacityBlockResponseDto], nullable: true }) blocks?:
    | CapacityBlockResponseDto[]
    | null;
}
