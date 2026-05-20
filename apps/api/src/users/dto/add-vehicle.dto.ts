import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AddVehicleDto {
  @ApiPropertyOptional({ example: 'Moje auto' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nickname?: string;

  @ApiProperty({ example: 'Toyota' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  make!: string;

  @ApiProperty({ example: 'Corolla' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  model!: string;

  @ApiProperty({ example: 2020 })
  @IsInt()
  @Min(1900)
  @Max(2030)
  year!: number;

  @ApiProperty({ example: '205/55R16' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  tireSize!: string;
}
