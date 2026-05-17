import { ApiProperty } from '@nestjs/swagger';

export class LinkedBookingDto {
  @ApiProperty() referenceCode!: string;
  @ApiProperty() clientName!: string;
  @ApiProperty() startAt!: string;
}

export class WorkerTaskResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiProperty({ type: String, nullable: true }) workerId!: string | null;
  @ApiProperty({ type: String, nullable: true }) workerName!: string | null;
  @ApiProperty() title!: string;
  @ApiProperty() startAt!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty({ type: String, nullable: true }) notes!: string | null;
  @ApiProperty({ type: String, nullable: true }) linkedBookingId!: string | null;
  @ApiProperty({ nullable: true, type: LinkedBookingDto }) linkedBooking!: LinkedBookingDto | null;
  @ApiProperty() createdAt!: string;
}
