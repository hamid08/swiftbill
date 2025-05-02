import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ApplicationSettingDocument,
  ApplicationSettingSchema,
  BrandDocument,
  BrandSchema,
  DeviceModelDocument,
  DeviceModelSchema,
  IoParameterDocument,
  IoParameterSchema,
  TrackerDocument,
  TrackerEventDocument,
  TrackerEventSchema,
  TrackerExtensionDocument,
  TrackerExtensionSchema,
  TrackerSchema,
  TrackerTravelDocument,
  TrackerTravelSchema,
  TrackingDataDocument,
  TrackingDataSchema,
  TrackingDeviceDocument,
  TrackingDeviceSchema,
  ViolationDocument,
  ViolationSchema
} from './schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ApplicationSettingDocument.name, schema: ApplicationSettingSchema },
      { name: BrandDocument.name, schema: BrandSchema },
      { name: DeviceModelDocument.name, schema: DeviceModelSchema },
      { name: IoParameterDocument.name, schema: IoParameterSchema },
      { name: TrackerDocument.name, schema: TrackerSchema },
      { name: TrackingDataDocument.name, schema: TrackingDataSchema },
      { name: TrackingDeviceDocument.name, schema: TrackingDeviceSchema },
      { name: TrackerExtensionDocument.name, schema: TrackerExtensionSchema },
      { name: TrackerEventDocument.name, schema: TrackerEventSchema },
      { name: TrackerTravelDocument.name, schema: TrackerTravelSchema },
      { name: ViolationDocument.name, schema: ViolationSchema },
    ]),
  ],
  exports: [
    MongooseModule.forFeature([
      { name: ApplicationSettingDocument.name, schema: ApplicationSettingSchema },
      { name: BrandDocument.name, schema: BrandSchema },
      { name: DeviceModelDocument.name, schema: DeviceModelSchema },
      { name: IoParameterDocument.name, schema: IoParameterSchema },
      { name: TrackerDocument.name, schema: TrackerSchema },
      { name: TrackingDataDocument.name, schema: TrackingDataSchema },
      { name: TrackingDeviceDocument.name, schema: TrackingDeviceSchema },
      { name: TrackerExtensionDocument.name, schema: TrackerExtensionSchema },
      { name: TrackerEventDocument.name, schema: TrackerEventSchema },
      { name: TrackerTravelDocument.name, schema: TrackerTravelSchema },
      { name: ViolationDocument.name, schema: ViolationSchema },
    ]),
  ],
})
export class TrackingMongoModule { }
