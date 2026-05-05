import { ApiProperty } from '@nestjs/swagger';
import { RimTierDto } from './rim-tier.dto';
import { SubServiceConfigDto } from './sub-service-config.dto';

export class ServiceVariantResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty({ type: [RimTierDto] })
  rimTiers!: RimTierDto[];

  @ApiProperty({ type: [SubServiceConfigDto] })
  subServices!: SubServiceConfigDto[];
}
