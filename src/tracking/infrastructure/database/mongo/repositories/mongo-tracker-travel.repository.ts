// import { Injectable, Logger } from '@nestjs/common';
// import { Connection, Model } from 'mongoose';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import { AbstractRepository } from 'src/common';
// import { TrackerTravelDocument } from '../schema';
// import { ActiveStatus, AllowedArea, AllowedAreaDocument, TrackerTravel, TrackerTravelRepository } from 'src/tracking';

// @Injectable()
// export class MongoTrackerTravelRepository
//     extends AbstractRepository<TrackerTravelDocument>
//     implements TrackerTravelRepository {

//     protected readonly logger = new Logger(MongoTrackerTravelRepository.name);

//     constructor(
//         @InjectModel(TrackerTravelDocument.name) private trackerTravelModel: Model<TrackerTravelDocument>,
//         @InjectConnection() connection: Connection,
//     ) {
//         super(trackerTravelModel, connection);
//     }

//     async addTravel(trackerTravel: TrackerTravel): Promise<void> {

//         const allowedAreaDocuments: AllowedAreaDocument[] | undefined = trackerTravel.getAllowedAreas()?.map((area) => ({
//             caption: area.getCaption(),
//             type: area.getType(),
//             geoContent: area.getGeoContent()
//         }));

//         await this.create({
//             activeStatus: trackerTravel.getActiveStatus(),
//             caption: trackerTravel.getCaption(),
//             imei: trackerTravel.getImei(),
//             terminalNumber: trackerTravel.getTerminalNumber(),
//             maximumGeofenceBreach: trackerTravel.getMaximumGeofenceBreach(),
//             startTrip: trackerTravel.getStartTrip(),
//             tripType: trackerTravel.getTripType(),
//             driverName: trackerTravel.getDriverName(),
//             duration: trackerTravel.getDuration(),
//             tripNumber: trackerTravel.getTripNumber(),
//             path: trackerTravel.getPath(),
//             allowedAreas: allowedAreaDocuments
//         })
//     }


//     async deactiveAllTravels(terminalNumber: string): Promise<void> {
//         try {
//             const result = await this.updateAll(
//                 { terminalNumber, activeStatus: ActiveStatus.Active }, // Filter: only active travels
//                 { $set: { activeStatus: ActiveStatus.Deactive } }
//             );

//             this.logger.log(`Deactivated ${result.modifiedCount} travel records for terminalNumber: ${terminalNumber}`);
//         } catch (error) {
//             this.logger.error(`Failed to deactivate travels: ${error.message}`, error.stack);
//         }
//     }


//     async getAllActiveTravels(terminalNumber: string): Promise<TrackerTravel[]> {

//         try {
//             const travels = await this.find({ terminalNumber, activeStatus: ActiveStatus.Active });
//             return travels.map((doc) => {
//                 return TrackerTravel.mapToDomain({
//                     id: doc._id.toString(),
//                     ...doc,
//                     allowedAreas: doc.allowedAreas ? doc.allowedAreas.map((allowedArea) => {
//                         return AllowedArea.mapToDomain(allowedArea.caption, allowedArea.type, {
//                             type: allowedArea.geoContent.type,
//                             coordinates: allowedArea.geoContent.coordinates
//                         });
//                     }) : [],
//                     path: {
//                         type: doc.path.type,
//                         coordinates: doc.path.coordinates
//                     }
//                 });
//             }) ?? [];
//         } catch (error) {
//             this.logger.error(error);
//             return [];
//         }
//     }
// }