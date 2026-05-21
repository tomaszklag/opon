import { ApiProperty } from '@nestjs/swagger';

export class AppProviderResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() type!: string;
  @ApiProperty({ nullable: true, type: String }) logoUrl!: string | null;
  @ApiProperty({ nullable: true, type: String }) tagline!: string | null;
  @ApiProperty({ nullable: true, type: String }) address!: string | null;
  @ApiProperty({ nullable: true, type: Number }) cityCenterLat!: number | null;
  @ApiProperty({ nullable: true, type: Number }) cityCenterLng!: number | null;
  @ApiProperty() serviceRadiusKm!: number;
  @ApiProperty() avgRating!: number;
  @ApiProperty() reviewCount!: number;
  @ApiProperty({ nullable: true, type: String }) description!: string | null;
  @ApiProperty({ nullable: true, type: String }) phone!: string | null;
  @ApiProperty() showPhone!: boolean;
  @ApiProperty({ type: [String] }) vehicleTypes!: string[];
  @ApiProperty({ type: [String] }) tireSizes!: string[];
  @ApiProperty({ type: [String] }) additionalServices!: string[];
}

export class AppProviderListResponseDto {
  @ApiProperty({ type: [AppProviderResponseDto] }) data!: AppProviderResponseDto[];
  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}
