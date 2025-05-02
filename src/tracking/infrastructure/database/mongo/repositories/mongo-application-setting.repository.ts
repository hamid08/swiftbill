// import { Injectable, Logger } from '@nestjs/common';
// import { Connection, Model } from 'mongoose';
// import { InjectConnection, InjectModel } from '@nestjs/mongoose';
// import { AbstractRepository } from 'src/common';
// import { ApplicationSettingDocument } from '../schema';
// import { ApplicationSetting, ApplicationSettingDomainDto, ApplicationSettingRepository } from 'src/tracking/domain';

// @Injectable()
// export class MongoApplicationSettingRepository
//   extends AbstractRepository<ApplicationSettingDocument>
//   implements ApplicationSettingRepository {
//   protected readonly logger = new Logger(MongoApplicationSettingRepository.name);

//   constructor(
//     @InjectModel(ApplicationSettingDocument.name)
//     private applicationSettingModel: Model<ApplicationSettingDocument>,
//     @InjectConnection() connection: Connection,
//   ) {
//     super(applicationSettingModel, connection);
//   }

//   async getApplicationSetting(): Promise<ApplicationSetting | null> {
//     const setting = await this.findOne({});
//     if (!setting) return null;

//     // Map to domain using DTO
//     const settingDto: ApplicationSettingDomainDto = {
//       id: setting._id.toString(),
//       ...setting
//     };

//     return ApplicationSetting.mapToDomain(settingDto);
//   }
// }
