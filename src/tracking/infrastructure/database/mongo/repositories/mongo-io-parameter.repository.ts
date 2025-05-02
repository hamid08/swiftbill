// import { Injectable, Logger } from '@nestjs/common';
// import { Connection, Model } from 'mongoose';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import { AbstractRepository } from 'src/common';
// import { IoParameterDocument } from '../schema';
// import { IoParameter, IoParameterRepository } from 'src/tracking/domain';

// @Injectable()
// export class MongoIoParameterRepository
//     extends AbstractRepository<IoParameterDocument>
//     implements IoParameterRepository {

//     protected readonly logger = new Logger(MongoIoParameterRepository.name);

//     constructor(
//         @InjectModel(IoParameterDocument.name) private ioParameter: Model<IoParameterDocument>,
//         @InjectConnection() connection: Connection,
//     ) {
//         super(ioParameter, connection);
//     }

//     async upsertIoParameters(ioParameters: IoParameter[]): Promise<void> {
//         const bulkOps = ioParameters.map(ioParameter => ({
//             updateOne: {
//                 filter: { ioParameterId: ioParameter.getIoParameterId() }, // Filter by `ioParameterId`
//                 update: {
//                     $set: {
//                         modelId: ioParameter.getModelId(),
//                         caption: ioParameter.getCaption(),
//                         name: ioParameter.getName(),
//                         key: ioParameter.getKey(),
//                         unit: ioParameter.getUnit(),
//                         icon: ioParameter.getIcon(),
//                         isEvent: ioParameter.getIsEvent(),
//                         showInPanel: ioParameter.getShowInPanel(),
//                         valueTypes: ioParameter.getValueTypes()
//                     }
//                 },
//                 upsert: true, // Enable upsert
//             }
//         }));

//         try {
//             // Perform bulk write for all IoParameters
//             const result = await this.ioParameter.bulkWrite(bulkOps);
//         } catch (error) {
//             this.logger.error(`Failed to upsert IoParameters: ${error.message}`, error.stack);
//         }
//     }
// }
