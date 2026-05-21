import { ApiProperty } from '@nestjs/swagger';

export class DepotStatsResponseDto {
  @ApiProperty() inDepot!: number;
  @ApiProperty() dueSoon!: number;
  @ApiProperty() revenueMonth!: number;
}
