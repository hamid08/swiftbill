import { ICommand } from '@nestjs/cqrs';
import { IoElement, IoElementDto, LocationType } from 'src/tracking/domain';

export class AssignmentRealtimeDataCommand implements ICommand {
  constructor(public readonly data: AssignmentRealtimeDataCommandModel) { }
}

export class AssignmentRealtimeDataCommandModel {
  imei: string;
  deviceTerminalNo: string;
  trafficDate: Date;
  altitude: number;
  angle: number;
  latitude: number;
  longitude: number;
  speed: number;
  traceMode: boolean;
  locationType: LocationType;
  ioElements?: IoElementDto[];
  extensionId?: string;
}
