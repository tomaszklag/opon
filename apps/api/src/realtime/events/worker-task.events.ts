export class WorkerTaskCreatedEvent {
  static readonly EVENT = 'worker-task.created';
  constructor(
    public readonly providerId: string,
    public readonly taskId: string,
    public readonly weekStart: string,
  ) {}
}

export class WorkerTaskDeletedEvent {
  static readonly EVENT = 'worker-task.deleted';
  constructor(
    public readonly providerId: string,
    public readonly taskId: string,
    public readonly weekStart: string,
  ) {}
}
