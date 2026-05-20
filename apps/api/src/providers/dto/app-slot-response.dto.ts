import { ApiProperty } from '@nestjs/swagger';

export class AppSlotResponseDto {
  @ApiProperty({ description: 'Equals startAt ISO string — use as slotId when booking' })
  id!: string;

  @ApiProperty() startAt!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty() available!: boolean;
}
