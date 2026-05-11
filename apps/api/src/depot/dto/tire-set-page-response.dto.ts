import { ApiProperty } from '@nestjs/swagger';
import { TireSetResponseDto } from './tire-set-response.dto';

export class TireSetPageResponseDto {
  @ApiProperty({ type: [TireSetResponseDto] }) items!: TireSetResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() pageSize!: number;
}
