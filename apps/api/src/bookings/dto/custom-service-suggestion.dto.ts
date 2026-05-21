import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CustomServiceSuggestionDto {
  @ApiProperty() name!: string;
  @ApiPropertyOptional({ type: Number, nullable: true }) avgPricePln!: number | null;
  @ApiPropertyOptional({ type: Number, nullable: true }) avgDurationMinutes!: number | null;
  @ApiProperty() count!: number;
}
