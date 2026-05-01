export class BookingCreatedEvent {
  static readonly EVENT = 'booking.created';

  constructor(
    public readonly providerId: string,
    public readonly bookingId: string,
    public readonly referenceCode: string,
    public readonly weekStart: string,
  ) {}
}

export class BookingStatusChangedEvent {
  static readonly EVENT = 'booking.status_changed';

  constructor(
    public readonly providerId: string,
    public readonly bookingId: string,
    public readonly referenceCode: string,
    public readonly weekStart: string,
    public readonly newStatus: string,
  ) {}
}

export class BookingBulkStatusChangedEvent {
  static readonly EVENT = 'booking.bulk_status_changed';

  constructor(
    public readonly providerId: string,
    public readonly ids: string[],
    public readonly action: string,
  ) {}
}
