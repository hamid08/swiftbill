// import { Injectable, Logger } from '@nestjs/common';
// import { Connection, Model } from 'mongoose';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import { AbstractRepository } from 'src/common';
// import { IoElementDocument, TrackerDocument, TrackerLocationDocument } from '../schema';
// import { Tracker, TrackerRepository, TrackerLocation } from 'src/tracking/domain';

// @Injectable()
// export class MongoTrackerRepository
//     extends AbstractRepository<TrackerDocument>
//     implements TrackerRepository {
//     protected readonly logger = new Logger(MongoTrackerRepository.name);

//     constructor(
//         @InjectModel(TrackerDocument.name) private trackerModel: Model<TrackerDocument>,
//         @InjectConnection() connection: Connection,
//     ) {
//         super(trackerModel, connection);
//     }

//     async updateTrackerLocation(terminalNumber: string, tracker: Tracker): Promise<void> {
//         const updateDocument = this.buildUpdateDocument(tracker);
//         const query = this.buildUpdateQuery(terminalNumber, tracker.getLastTrackingTime());

//         // Attempt to update the document
//         const result = await this.findOneAndUpdate(query, { $set: updateDocument });

//         // Update `trackerLastConnectionTime` if no document matched
//         if (!result) {
//             await this.updateLastConnectionTime(terminalNumber, tracker.getTrackerLastConnectionTime());
//         }
//     }

//     /**
//      * Builds the update document for the tracker location.
//      */
//     private buildUpdateDocument(tracker: Tracker): Partial<TrackerDocument> {
//         const trackerLocation: TrackerLocation = tracker.getTrackerLocation();
//         const trackerLocationDocument: TrackerLocationDocument = {
//             type: trackerLocation.getType(),
//             coordinates: trackerLocation.getCoordinates(),
//         };

//         const ioElementDocument: IoElementDocument[] | undefined = tracker.getIoElements()?.map((io) => ({
//             key: io.getKey(),
//             value: io.getValue(),
//         }));

//         return {
//             lastTrackingTime: tracker.getLastTrackingTime(),
//             trackerLastConnectionTime: tracker.getTrackerLastConnectionTime(),
//             trafficDate: tracker.getTrafficDate(),
//             altitude: tracker.getAltitude(),
//             angle: tracker.getAngle(),
//             ioElements: ioElementDocument,
//             latitude: tracker.getLatitude(),
//             longitude: tracker.getLongitude(),
//             speed: tracker.getSpeed(),
//             trackerLocation: trackerLocationDocument,
//         };
//     }

//     /**
//      * Builds the query to find and update the tracker document.
//      */
//     private buildUpdateQuery(terminalNumber: string, lastTrackingTime: Date) {
//         return {
//             $and: [
//                 {
//                     trackingDevices: {
//                         $elemMatch: { isDefault: true, terminalNumber },
//                     },
//                 },
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
//      * Updates the `trackerLastConnectionTime` if no matching document is found.
//      */
//     private async updateLastConnectionTime(terminalNumber: string, lastConnectionTime: Date) {
//         await this.updateOne(
//             {
//                 trackingDevices: {
//                     $elemMatch: { isDefault: true, terminalNumber },
//                 },
//             },
//             { $set: { trackerLastConnectionTime: lastConnectionTime } },
//         );
//     }
// }
