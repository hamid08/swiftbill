import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/common';
import { ActiveStatus, GeometryType, PlaqueStatus, PlaqueType, TrackerType } from 'src/tracking/domain';
import { IoElementDocument } from './common';

// Tracker Vehicle Schema
@Schema({ _id: false, versionKey: false })
export class TrackerVehicleDocument {
    @Prop({ type: String })
    vehicleId: string;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String })
    identity: string;

    @Prop({ type: String })
    businessCaption: string;

    @Prop({ type: Number, enum: PlaqueStatus })
    plaqueStatus: PlaqueStatus;

    @Prop({ type: Number, enum: PlaqueType })
    plaqueType: PlaqueType;

    @Prop({ type: String })
    plaqueNo: string;

    @Prop({ type: String, required: false })
    vehicleUserTypeId?: string;

    @Prop({ type: String, required: false })
    vehicleUserTypeCaption?: string;

    @Prop({ type: String, required: false })
    vehicleModelCaption?: string;

    @Prop({ type: String, required: false })
    vehicleModelId?: string;

    @Prop({ type: String, required: false })
    companyName?: string;

    @Prop({ type: String, required: false })
    image?: string;
}

// Tracker Device Schema
@Schema({ _id: false, versionKey: false })
export class TrackerDeviceDocument {
    @Prop({ type: String })
    imei: string;

    @Prop({ type: String, index: true })
    terminalNumber: string;

    @Prop({ type: Boolean, default: false })
    isDefault: boolean;

    @Prop({ type: String })
    serial: string;

    @Prop({ type: String, required: false })
    caption?: string;

    @Prop({ type: String, required: false })
    simCardNumber?: string;

    @Prop({ type: String, required: false })
    remoteDynamicPassword?: string;

    @Prop({ type: String, required: false })
    deviceIdentity?: string;

    @Prop({ type: String, required: false })
    description?: string;

    @Prop({ type: String, required: false })
    modelId?: string;

    @Prop({ type: Number, enum: ActiveStatus, default: ActiveStatus.Active })
    activeStatus: ActiveStatus;

    @Prop({ type: Date })
    startDate: Date;

    @Prop({ type: Date, required: false, nullable: true })
    endDate?: Date;
}

// Tracker Location Schema
@Schema({ _id: false, versionKey: false })
export class TrackerLocationDocument {
    @Prop({ type: String, enum: ['Point', 'LineString', 'Polygon'], default: 'Point' })
    type: GeometryType;

    // Coordinates array to accommodate both 'Point', 'LineString', and 'Polygon'
    @Prop({ type: [Number], required: true, minlength: 2, maxlength: 2 })
    coordinates: [number, number]; // Default for 'Point'
}

// Tracker Schema
@Schema({ versionKey: false, collection: 'Trackers' })
export class TrackerDocument extends AbstractDocument {
    @Prop({ type: Number, enum: TrackerType, required: true, default: TrackerType.Vehicle })
    objectType: TrackerType;

    @Prop({ type: String, required: true })
    businessId: string;

    @Prop({ type: TrackerVehicleDocument })
    vehicleInfo?: TrackerVehicleDocument;

    @Prop({ type: [TrackerDeviceDocument], default: [] })
    trackingDevices: TrackerDeviceDocument[];

    @Prop({ type: TrackerLocationDocument })
    trackerLocation?: TrackerLocationDocument;

    @Prop({ type: Date, index: true })
    trafficDate?: Date;

    @Prop({ type: Number })
    altitude?: number;

    @Prop({ type: Number })
    angle?: number;

    @Prop({ type: Number })
    latitude?: number;

    @Prop({ type: Number })
    longitude?: number;

    @Prop({ type: Number })
    speed?: number;

    @Prop({ type: Date })
    lastTrackingTime?: Date;

    @Prop({ type: Date, index: true })
    trackerLastConnectionTime?: Date;

    @Prop({ type: [IoElementDocument], default: [] })
    ioElements?: IoElementDocument[];
}

export const TrackerSchema = SchemaFactory.createForClass(TrackerDocument);

// Adding geospatial index for efficient location-based queries
TrackerSchema.index({ 'trackerLocation.coordinates': '2dsphere' });
