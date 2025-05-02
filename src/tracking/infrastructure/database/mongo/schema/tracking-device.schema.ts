import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/common';
import { ActiveStatus } from 'src/tracking/domain';

@Schema({ versionKey: false, collection: 'TrackingDevices' })
export class TrackingDeviceDocument extends AbstractDocument {
    @Prop({ type: String, index: true })
    imei: string;

    @Prop({ type: String, index: true })
    terminalNumber: string;

    @Prop({ type: String, required: true })
    businessId: string;

    @Prop({ type: String, required: true })
    vehicleId: string;

    @Prop({ type: Boolean, default: false })
    isDefault: boolean;

    @Prop({ type: String, required: true })
    serial: string;

    @Prop({ type: String, required: true })
    caption: string;

    @Prop({ type: String, required: false })
    simCardNumber?: string;

    @Prop({ type: String, required: false })
    remoteDynamicPassword?: string;

    @Prop({ type: String, required: false })
    deviceIdentity?: string;

    @Prop({ type: String, required: false })
    modelId?: string;

    @Prop({ type: Number, enum: ActiveStatus, default: ActiveStatus.Active })
    activeStatus: ActiveStatus;

    @Prop({ type: Date })
    lastTrackingTime?: Date;

    @Prop({ type: Date })
    trackerLastConnectionTime?: Date;

    @Prop({ type: Date, required: true })
    startDate: Date;

    @Prop({ type: Date })
    endDate?: Date;
}

export const TrackingDeviceSchema = SchemaFactory.createForClass(TrackingDeviceDocument);
