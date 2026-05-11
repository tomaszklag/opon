import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TireSetResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() clientName!: string;
  @ApiProperty() clientPhone!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) vehicleName!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) licensePlate!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) brand!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) model!: string | null;
  @ApiProperty() tireSize!: string;
  @ApiProperty() tireType!: string;
  @ApiProperty() isOnRims!: boolean;
  @ApiProperty() condition!: string;
  @ApiProperty() status!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) slotId!: string | null;
  @ApiPropertyOptional({ type: String, nullable: true }) slotLabel!: string | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) storagePricePln!: number | null;
  @ApiPropertyOptional({ type: String, nullable: true }) releaseDue!: string | null;
  @ApiProperty() createdAt!: string;
}
