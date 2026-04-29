import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookingResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() referenceCode!: string;
  @ApiProperty() status!: string;
  @ApiProperty() startAt!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty() clientName!: string;
  @ApiProperty() clientPhone!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) tireSize!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) serviceType!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) sizeTier!: string | null;
  @ApiProperty() tpmsRequired!: boolean;
  @ApiPropertyOptional({ type: Number, nullable: true }) basePricePln!: number | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) travelFeePln!: number | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) totalPricePln!: number | null;
  @ApiPropertyOptional({ type: String, nullable: true }) stationId!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) notes!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() isManual!: boolean;
}
