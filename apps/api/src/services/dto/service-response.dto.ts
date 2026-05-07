import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ServiceVariantResponseDto {
  @ApiProperty() id!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) name!: string | null;
  @ApiProperty({ type: [String] }) rimSizes!: string[];
  @ApiProperty({ type: Number }) pricePln!: number;
  @ApiProperty({ type: Number }) durationMinutes!: number;
  @ApiProperty({ type: Number }) sortOrder!: number;
}

export class ServiceResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ type: String, nullable: true }) description!: string | null;
  @ApiProperty({ enum: ['FLAT', 'VARIANTS', 'RIM_SIZES'] }) pricingType!: string;
  @ApiProperty() enabled!: boolean;
  @ApiProperty({ type: Number }) sortOrder!: number;
  @ApiProperty({ type: [ServiceVariantResponseDto] }) variants!: ServiceVariantResponseDto[];
  @ApiProperty({ type: [String] }) subServiceIds!: string[];
  @ApiProperty({ type: [String] }) addonIds!: string[];
}
