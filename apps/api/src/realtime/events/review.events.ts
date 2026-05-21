export class ReviewCreatedEvent {
  static readonly EVENT = 'review.created';

  constructor(
    public readonly providerId: string,
    public readonly reviewId: string,
    public readonly bookingReferenceCode: string,
    public readonly rating: number,
  ) {}
}
