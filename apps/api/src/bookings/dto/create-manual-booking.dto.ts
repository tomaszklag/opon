import {
  IsBoolean,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateManualBookingDto {
  @ApiProperty({ example: 'Jan Kowalski' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  clientName!: string;

  @ApiProperty({ example: '+48123456789' })
  @IsString()
  @Matches(/^\+\d{9,15}$/, { message: 'Podaj numer telefonu w formacie E.164, np. +48123456789' })
  clientPhone!: string;

  @ApiProperty({ example: '2026-05-01T09:00:00.000Z' })
  @IsISO8601()
  startAt!: string;

  @ApiProperty({ example: '2026-05-01T09:30:00.000Z' })
  @IsISO8601()
  endAt!: string;

  @ApiPropertyOptional({ example: '205/55R16' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  tireSize?: string;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  totalPricePln?: number;

  @ApiPropertyOptional({ example: 'SEASONAL_SWAP' })
  @IsOptional()
  @IsString()
  serviceType?: string;

  @ApiPropertyOptional({ example: 'Klient prosi o kontakt przed wizytą.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  stationId?: string;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  autoConfirm?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'Pomiń walidację dostępności (recepcja świadomie nadpisuje)',
  })
  @IsOptional()
  @IsBoolean()
  skipAvailabilityCheck?: boolean;
}
