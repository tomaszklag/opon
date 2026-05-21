import { ApiProperty } from '@nestjs/swagger';

export class ClientSearchResultDto {
  @ApiProperty() phone!: string;
  @ApiProperty() name!: string;
}
