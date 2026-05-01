import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';

export class ServiceConfigResponseDto {
  @ApiProperty({ enum: ServiceType }) serviceType!: ServiceType;
  @ApiProperty({ example: 45 }) durationMinutes!: number;
}
