import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppBookingProviderDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  address!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  phone!: string | null;
}

export class AppBookingSlotDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  startAt!: string;

  @ApiProperty()
  endAt!: string;
}

export class AppBookingResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  bookingCode!: string;

  @ApiProperty({ enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'] })
  status!: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

  @ApiProperty({ type: () => AppBookingProviderDto })
  provider!: AppBookingProviderDto;

  @ApiProperty({ type: () => AppBookingSlotDto })
  slot!: AppBookingSlotDto;

  @ApiProperty()
  vehicleTireSize!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  note!: string | null;

  @ApiProperty()
  createdAt!: string;
}
