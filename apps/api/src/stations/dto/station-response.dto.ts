import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';

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
  @ApiProperty({ enum: ServiceType, isArray: true }) services!: ServiceType[];
  @ApiProperty() schedule!: unknown;
  @ApiProperty({ type: [StationWorkerResponseDto] }) workers!: StationWorkerResponseDto[];
  @ApiProperty() createdAt!: Date;
}
