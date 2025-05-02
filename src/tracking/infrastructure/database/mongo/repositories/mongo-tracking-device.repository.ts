// import { Injectable, Logger } from '@nestjs/common';
// import { Connection, Model } from 'mongoose';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import { AbstractRepository } from 'src/common';
// import { TrackingDeviceDocument } from '../schema';
// import { ActiveStatus, TrackingDevice, TrackingDeviceRepository } from 'src/tracking/domain';

// @Injectable()
// export class MongoTrackingDeviceRepository
//     extends AbstractRepository<TrackingDeviceDocument>
//     implements TrackingDeviceRepository {
//     protected readonly logger = new Logger(MongoTrackingDeviceRepository.name);

//     constructor(
//         @InjectModel(TrackingDeviceDocument.name) private trackingDeviceModel: Model<TrackingDeviceDocument>,
//         @InjectConnection() connection: Connection,
//     ) {
//         super(trackingDeviceModel, connection);
//     }

//     async getActiveDeviceByImei(imei: string): Promise<TrackingDevice | null> {
//         try {
//             const deviceDocument = await this.findOne({
//                 imei,
//                 activeStatus: ActiveStatus.Active,
//                 $or: [{ endDate: null }, { endDate: { $exists: false } }],
//             });

//             if (!deviceDocument) {
//                 this.logger.warn(`Active device not found for IMEI: ${imei}`);
//                 return null;
//             }

//             return TrackingDevice.mapToDomain({
//                 id: deviceDocument._id.toString(),
//                 ...deviceDocument
//             });
//         } catch (error) {
//             this.logger.error(`Error while retrieving active device for IMEI: ${imei}`, error);
//             return null;
//         }
//     }


//     /**
//     * Updates the tracking device information.
//     * If no matching document is found, updates the `trackerLastConnectionTime`.
//     */
//     async updateTrackingTime(terminalNumber: string, trackingDevice: TrackingDevice): Promise<void> {
//         const updateData = this.buildUpdateData(trackingDevice);
//         const query = this.buildUpdateQuery(terminalNumber, trackingDevice.getLastTrackingTime());

//         const result = await this.findOneAndUpdate(query, { $set: updateData });

//         if (!result) {
//             await this.updateLastConnectionTime(terminalNumber, trackingDevice.getTrackerLastConnectionTime());
//         }
//     }

//     /**
//     * Builds the update data for a tracking device.
//     */
//     private buildUpdateData(trackingDevice: TrackingDevice): Partial<TrackingDeviceDocument> {
//         return {
//             lastTrackingTime: trackingDevice.getLastTrackingTime(),
//             trackerLastConnectionTime: trackingDevice.getTrackerLastConnectionTime(),
//         };
//     }

//     /**
//      * Builds a query to find and update a tracking device.
//      */
//     private buildUpdateQuery(terminalNumber: string, lastTrackingTime: Date): Record<string, unknown> {
//         return {
//             $and: [
//                 { terminalNumber },
//                 {
//                     $or: [
//                         { lastTrackingTime: { $exists: false } },
//                         { lastTrackingTime: { $lt: lastTrackingTime } },
//                     ],
//                 },
//             ],
//         };
//     }

//     /**
//      * Updates the `trackerLastConnectionTime` for a tracking device.
//      */
//     private async updateLastConnectionTime(terminalNumber: string, lastConnectionTime: Date): Promise<void> {
//         await this.updateOne(
//             { terminalNumber },
//             { $set: { trackerLastConnectionTime: lastConnectionTime } },
//         );
//     }


// }
