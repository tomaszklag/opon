import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class AppCreateBookingDto {
  @ApiProperty({ example: 'uuid-of-provider' })
  @IsUUID()
  providerId!: string;

  @ApiProperty({
    example: '2026-05-01T09:00:00.000Z',
    description: 'ISO 8601 string representing slot startAt',
  })
  @IsString()
  @IsNotEmpty()
  slotId!: string;

  @ApiProperty({ example: 'uuid-of-vehicle' })
  @IsUUID()
  vehicleId!: string;

  @ApiPropertyOptional({ example: 'ul. Przykładowa 1, Warszawa' })
  @IsOptional()
  @IsString()
  address?: string;
}
