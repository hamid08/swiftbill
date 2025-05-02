// import { Injectable, Logger } from '@nestjs/common';
// import { Connection, Model } from 'mongoose';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import { AbstractRepository } from 'src/common';
// import { TrackerEventDocument } from '../schema';
// import { TrackerEvent, TrackerEventRepository } from 'src/tracking/domain';

// @Injectable()
// export class MongoTrackerEventRepository
//   extends AbstractRepository<TrackerEventDocument>
//   implements TrackerEventRepository {
//   protected readonly logger = new Logger(MongoTrackerEventRepository.name);

//   constructor(
//     @InjectModel(TrackerEventDocument.name)
//     private trackerEventModel: Model<TrackerEventDocument>,
//     @InjectConnection() connection: Connection,
//   ) {
//     super(trackerEventModel, connection);
//   }

//   async addRange(data: TrackerEvent[]): Promise<void> {
//     await this.createAll(
//       data.map(event => {
//         let ioElement = event.getIoElement();
//         return {
//           imei: event.getImei(),
//           eventTime: event.getEventTime(),
//           ioElement: {
//             key: ioElement.getKey(),
//             value: ioElement.getValue()
//           },
//           isVisited: event.getIsVisited(),
//           level: event.getLevel(),
//           terminalNumber: event.getTerminalNumber(),
//           altitude: event.getAltitude(),
//           angle: event.getAngle(),
//           latitude: event.getAltitude(),
//           longitude: event.getLongitude(),
//           speed: event.getSpeed(),
//           trackerExtensionId: event.getTrackerExtensionId()
//         }
//       })
//     );
//   }

// }
