import { ICommand } from '@nestjs/cqrs';

export class TrackerRealtimeEventCommand implements ICommand {
  constructor(public readonly data: TrackerRealtimeEventCommandModel[]) { }
}

export class TrackerRealtimeEventCommandModel {
  trackerId: number;
}
