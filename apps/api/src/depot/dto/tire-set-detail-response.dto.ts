import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StoragePeriodResponseDto } from './storage-period-response.dto';

export class TireSetDetailResponseDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) clientId!: string | null;
  @ApiProperty() clientName!: string;
  @ApiProperty() clientPhone!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) vehicleName!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) licensePlate!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) brand!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) model!: string | null;
  @ApiProperty() tireSize!: string;
  @ApiProperty() tireType!: string;
  @ApiProperty() isOnRims!: boolean;
  @ApiPropertyOptional({ type: String, nullable: true }) dotCode!: string | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) treadDepthMm!: number | null;
  @ApiProperty() condition!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) slotId!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) slotLabel!: string | null;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ type: Number, nullable: true }) storagePricePln!: number | null;
  @ApiPropertyOptional({ type: String, nullable: true }) sourceBookingId!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) notes!: string | null;
  @ApiProperty() createdAt!: string;
  @ApiProperty() updatedAt!: string;
  @ApiProperty({ type: [StoragePeriodResponseDto] }) periods!: StoragePeriodResponseDto[];
}
