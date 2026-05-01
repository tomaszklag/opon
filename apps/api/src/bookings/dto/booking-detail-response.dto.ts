import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookingClientDto {
  @ApiProperty() clientId!: string;
  @ApiProperty() clientName!: string;
  @ApiProperty() clientPhone!: string;
  @ApiProperty() bookingCount!: number;
}

export class BookingVehicleDto {
  @ApiProperty() vehicleId!: string;
  @ApiProperty() nickname!: string;
  @ApiProperty() tireSize!: string;
}

export class BookingDetailResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() referenceCode!: string;
  @ApiProperty() status!: string;
  @ApiProperty() startAt!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty({ type: () => BookingClientDto }) client!: BookingClientDto;
  @ApiPropertyOptional({ type: () => BookingVehicleDto, nullable: true })
  vehicle!: BookingVehicleDto | null;
  @ApiPropertyOptional({ type: String, nullable: true }) addressLine!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) addressCity!: string | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) addressLat!: number | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) addressLng!: number | null;
  @ApiPropertyOptional({ type: String, nullable: true }) tireSize!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) serviceType!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) sizeTier!: string | null;
  @ApiProperty() tpmsRequired!: boolean;
  @ApiPropertyOptional({ type: Number, nullable: true }) basePricePln!: number | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) travelFeePln!: number | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) totalPricePln!: number | null;
  @ApiPropertyOptional({ type: String, nullable: true }) stationId!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) notes!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) rejectReason!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) cancelReason!: string | null;
  @ApiProperty() isManual!: boolean;
  @ApiProperty() createdAt!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) confirmedAt!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) startedAt!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) completedAt!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) cancelledAt!: string | null;
}
