// import { Injectable, Logger } from '@nestjs/common';
// import { Connection, Model } from 'mongoose';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import { AbstractRepository } from 'src/common';
// import { TrackerExtensionDocument } from '../schema';
// import { TrackerExtension, TrackerExtensionRepository } from 'src/tracking/domain';

// @Injectable()
// export class MongoTrackerExtensionRepository
//     extends AbstractRepository<TrackerExtensionDocument>
//     implements TrackerExtensionRepository {

//     protected readonly logger = new Logger(MongoTrackerExtensionRepository.name);

//     constructor(
//         @InjectModel(TrackerExtensionDocument.name) private trackerExtension: Model<TrackerExtensionDocument>,
//         @InjectConnection() connection: Connection,
//     ) {
//         super(trackerExtension, connection);
//     }

//     async updateStatus(trackerExtension: TrackerExtension): Promise<boolean> {
//         try {
//             var result = await this.updateOne(
//                 {
//                     terminalNumber: trackerExtension.getTerminalNumber(),
//                     trackerExtensionId: trackerExtension.getTrackerExtensionId()
//                 },
//                 { $set: { status: trackerExtension.getStatus() } },
//             );

//             return result.modifiedCount > 0;
//         } catch (error) {
//             this.logger.error(`Failed to active tracker extension: ${error.message}`, error.stack);
//         }

//         return false;
//     }
// }
