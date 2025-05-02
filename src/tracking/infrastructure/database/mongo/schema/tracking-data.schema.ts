import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/common';
import { IoElementDocument } from './common';
import { LocationType, TrackingDataCheckStage } from 'src/tracking';

@Schema({ versionKey: false, collection: 'TrackingData' })
export class TrackingDataDocument extends AbstractDocument {
  @Prop({ type: String, index: true })
  imei: string;

  @Prop({ type: String, index: true })
  terminalNumber: string;

  @Prop({ type: String, required: false })
  extensionId?: string;

  @Prop({ type: Date, index: true })
  trafficDate: Date;

  @Prop({ type: Number, required: false })
  altitude?: number;

  @Prop({ type: Number, required: false })
  angle?: number;

  @Prop({ type: Number, required: false })
  latitude?: number;

  @Prop({ type: Number, required: false })
  longitude?: number;

  @Prop({ type: Number, required: false })
  speed?: number;

  @Prop({ type: [IoElementDocument], default: [] })
  ioElements?: IoElementDocument[];

  @Prop({ type: Number, required: false, enum: LocationType })
  locationType?: LocationType;

  @Prop({ type: Number, required: true, enum: TrackingDataCheckStage })
  dcs: TrackingDataCheckStage; // ردیابی مرحله بررسی داده ها
}

export const TrackingDataSchema = SchemaFactory.createForClass(TrackingDataDocument);

// Compound indexes for optimized queries
TrackingDataSchema.index({ terminalNumber: 1, trafficDate: 1 });
TrackingDataSchema.index({ imei: 1, trafficDate: 1 }); // For the new API requirement
TrackingDataSchema.index({ trafficDate: 1 }); // General date-based queries