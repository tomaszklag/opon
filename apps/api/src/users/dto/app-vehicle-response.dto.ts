import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppVehicleResponseDto {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  nickname!: string | null;

  @ApiProperty()
  make!: string;

  @ApiProperty()
  model!: string;

  @ApiProperty()
  year!: number;

  @ApiProperty()
  tireSize!: string;
}
