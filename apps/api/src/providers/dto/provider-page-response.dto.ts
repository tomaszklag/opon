import { ApiProperty } from '@nestjs/swagger';
import { ProviderResponseDto } from './provider-response.dto';

export class ProviderPageResponseDto {
  @ApiProperty({ type: [ProviderResponseDto] }) data!: ProviderResponseDto[];
  @ApiProperty({ type: Number }) total!: number;
  @ApiProperty({ type: Number }) page!: number;
  @ApiProperty({ type: Number }) limit!: number;
}
