import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StationWorkerResponseDto {
  @ApiProperty() workerId!: string;
  @ApiProperty() workerName!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) workerRole!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) shiftStart!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) shiftEnd!: string | null;
}

export class StationResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ type: [String] }) serviceIds!: string[];
  @ApiProperty() schedule!: unknown;
  @ApiProperty({ type: [StationWorkerResponseDto] }) workers!: StationWorkerResponseDto[];
  @ApiProperty() createdAt!: Date;
}
