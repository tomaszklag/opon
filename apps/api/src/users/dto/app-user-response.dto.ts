import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AppUserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  phone!: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  firstName!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  lastName!: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  email!: string | null;

  @ApiProperty({ enum: ['CLIENT', 'PROVIDER'] })
  role!: 'CLIENT' | 'PROVIDER';
}
