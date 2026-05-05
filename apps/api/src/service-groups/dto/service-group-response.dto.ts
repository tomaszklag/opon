import { ApiProperty } from '@nestjs/swagger';
import { ServiceVariantResponseDto } from './service-variant-response.dto';

export class ServiceGroupResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  pricingMode!: string;

  @ApiProperty()
  sortOrder!: number;

  @ApiProperty({ type: [ServiceVariantResponseDto] })
  variants!: ServiceVariantResponseDto[];
}
