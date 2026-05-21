import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max } from 'class-validator';

export class UpsertDepotSlotsDto {
  @ApiProperty({ description: 'Section label, e.g. "A"' })
  @IsString()
  section!: string;

  @ApiProperty({ description: 'First row number (inclusive)' })
  @IsInt()
  @Min(1)
  rowFrom!: number;

  @ApiProperty({ description: 'Last row number (inclusive)' })
  @IsInt()
  @Min(1)
  rowTo!: number;

  @ApiProperty({ description: 'Number of positions per row' })
  @IsInt()
  @Min(1)
  @Max(50)
  positionsPerRow!: number;
}
