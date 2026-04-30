import { ApiProperty } from '@nestjs/swagger';

export class AvailabilitySlotDto {
  @ApiProperty() startAt!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty() isAvailable!: boolean;
  @ApiProperty() conflictCount!: number;
}

export class AvailabilityResponseDto {
  @ApiProperty({ type: [AvailabilitySlotDto] }) slots!: AvailabilitySlotDto[];
  @ApiProperty() slotMinutes!: number;
  @ApiProperty() isClosedDay!: boolean;
}
