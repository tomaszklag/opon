import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveType } from '@prisma/client';

export class WorkerStationResponseDto {
  @ApiProperty() stationId!: string;
  @ApiProperty() stationName!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) shiftStart!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) shiftEnd!: string | null;
}

export class LeaveResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: LeaveType }) type!: LeaveType;
  @ApiProperty() startDate!: Date;
  @ApiProperty() endDate!: Date;
  @ApiPropertyOptional({ type: String, nullable: true }) note!: string | null;
  @ApiProperty() createdAt!: Date;
}

export class WorkerResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) role!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty({ type: [WorkerStationResponseDto] }) stations!: WorkerStationResponseDto[];
  @ApiProperty({ type: [LeaveResponseDto] }) leaves!: LeaveResponseDto[];
}
