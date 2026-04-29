import { IsEnum, IsOptional } from 'class-validator';

export type ReviewTab = 'all' | 'pending' | 'replied' | 'reported';
export type ReviewRatingFilter = '5' | '4' | 'lte3';
export type ReviewSort = 'newest' | 'oldest_pending';

export class ReviewListQueryDto {
  @IsOptional()
  @IsEnum(['all', 'pending', 'replied', 'reported'])
  tab?: ReviewTab;

  @IsOptional()
  @IsEnum(['5', '4', 'lte3'])
  rating?: ReviewRatingFilter;

  @IsOptional()
  @IsEnum(['newest', 'oldest_pending'])
  sort?: ReviewSort;
}
