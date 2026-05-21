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
  /** SHA-256 fingerprint (8 hex chars) of active bookings for this day.
   *  Pass back as availabilityVersion in CreateManualBookingDto for fast
   *  stale-check before the serializable transaction. */
  @ApiProperty() version!: string;
}
