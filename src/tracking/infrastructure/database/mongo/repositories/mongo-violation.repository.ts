// import { Injectable, Logger } from '@nestjs/common';
// import { Connection, Model } from 'mongoose';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import { AbstractRepository } from 'src/common';
// import { ViolationDocument } from '../schema';
// import { Violation, ViolationRepository, ViolationType } from 'src/tracking/domain';

// @Injectable()
// export class MongoViolationRepository
//     extends AbstractRepository<ViolationDocument>
//     implements ViolationRepository {

//     protected readonly logger = new Logger(MongoViolationRepository.name);

//     constructor(
//         @InjectModel(ViolationDocument.name) private readonly violationModel: Model<ViolationDocument>,
//         @InjectConnection() connection: Connection,
//     ) {
//         super(violationModel, connection);
//     }

//     async hasViolationStarted(terminalNumber: string, type: ViolationType): Promise<boolean> {
//         try {
//             const violationExists = await this.exists({
//                 terminalNumber,
//                 type,
//                 $or: [
//                     { endDate: { $exists: false } }, // Violation has not ended
//                     { endDate: null }, // Explicitly null endDate
//                 ],
//             });
//             return !!violationExists; // Convert to boolean
//         } catch (error) {
//             this.logger.error(`Error checking if violation started: ${error.message}`, error.stack);
//             return false;
//         }
//     }

//     async startViolation(violation: Violation): Promise<void> {
//         try {
//             const startLocation = violation.getStartLocation();

//             const violationData = {
//                 registerDate: violation.getRegisterDate(),
//                 startDate: violation.getStartDate(),
//                 imei: violation.getImei(),
//                 terminalNumber: violation.getTerminalNumber(),
//                 location: {
//                     angle: startLocation.getAngle(),
//                     latitude: startLocation.getLatitude(),
//                     longitude: startLocation.getLongitude(),
//                     speed: startLocation.getSpeed(),
//                     altitude: startLocation.getAltitude(),
//                 },
//                 type: violation.getType(),
//             };

//             await this.create(violationData);
//         } catch (error) {
//             this.logger.error(`Error starting violation: ${error.message}`, error.stack);
//         }
//     }

//     async endViolation(violation: Violation): Promise<void> {
//         try {
//             const filterQuery = {
//                 terminalNumber: violation.getTerminalNumber(),
//                 type: violation.getType(),
//                 $or: [
//                     { endDate: { $exists: false } }, // Violation has not ended
//                     { endDate: null }, // Explicitly null endDate
//                 ],
//             };

//             const updateData = {
//                 $set: {
//                     endDate: violation.getEndDate(),
//                     endLocation: violation.getEndLocation(),
//                 },
//             };

//             const updateOptions = {
//                 sort: { registerDate: -1 }, // Sort by registerDate descending
//                 upsert: false,
//             };

//             await this.updateOne(filterQuery, updateData, updateOptions);
//         } catch (error) {
//             this.logger.error(`Error ending violation: ${error.message}`, error.stack);
//         }
//     }
// }
