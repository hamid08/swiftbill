// import { Injectable, Logger } from '@nestjs/common';
// import { Connection, Model } from 'mongoose';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import { AbstractRepository } from 'src/common';
// import { DeviceModelDocument } from '../schema';
// import { DeviceModel, DeviceModelRepository } from 'src/tracking/domain';

// @Injectable()
// export class MongoDeviceModelRepository
//     extends AbstractRepository<DeviceModelDocument>
//     implements DeviceModelRepository {
//     protected readonly logger = new Logger(MongoDeviceModelRepository.name);

//     constructor(
//         @InjectModel(DeviceModelDocument.name) private deviceModel: Model<DeviceModelDocument>,
//         @InjectConnection() connection: Connection,
//     ) {
//         super(deviceModel, connection);
//     }

//     async upsertModels(models: DeviceModel[]): Promise<void> {
//         const bulkOps = models.map(model => ({
//             updateOne: {
//                 filter: { modelId: model.getModelId() }, // Filter by `modelId`
//                 update: {
//                     $set: {
//                         caption: model.getCaption(),
//                         brandId: model.getBrandId(),
//                         deviceCommands: model.getDeviceCommands(),
//                         isMobile: model.getIsMobile(),
//                         hasTrackerExtension: model.getHasTrackerExtension(),
//                     }
//                 },
//                 upsert: true, // Enable upsert
//             }
//         }));

//         try {
//             // Perform bulk write for all models
//             const result = await this.deviceModel.bulkWrite(bulkOps);
//         } catch (error) {
//             this.logger.error(`Failed to upsert models: ${error.message}`, error.stack);
//         }
//     }
// }
