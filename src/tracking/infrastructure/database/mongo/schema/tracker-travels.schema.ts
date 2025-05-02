import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/common';
import { ActiveStatus, TripAreaType, Coordinates2D, Coordinates3D, GeometryType, TripCreationService } from 'src/tracking/domain';

@Schema({ _id: false, versionKey: false })
export class TrackerTravelPathDocument {
    @Prop({ type: String, required: true })
    type: GeometryType.LineString;

    @Prop({ type: [[Number]], required: true })
    coordinates: Coordinates2D;
}

@Schema({ _id: false, versionKey: false })
export class AllowedAreaGeoContentDocument {
    @Prop({ type: String, required: true })
    type: GeometryType.Polygon;

    @Prop({ type: [[[Number]]], required: true })
    coordinates: Coordinates3D;
}

@Schema({ _id: false, versionKey: false })
export class AllowedAreaDocument {
    @Prop({ type: String, required: true })
    caption: string;

    @Prop({ type: Number, enum: TripAreaType, required: true })
    type: TripAreaType;

    @Prop({ type: AllowedAreaGeoContentDocument, required: true })
    geoContent: AllowedAreaGeoContentDocument;
}

@Schema({ versionKey: false, collection: 'TrackerRoutes' })
export class TrackerTravelDocument extends AbstractDocument {

    @Prop({ type: String })
    imei: string;

    @Prop({ type: String, index: true })
    terminalNumber: string;

    @Prop({ type: String })
    caption: string;

    @Prop({ type: Number })
    maximumGeofenceBreach: number;

    @Prop({ type: Number, enum: ActiveStatus })
    activeStatus: ActiveStatus;

    @Prop({ type: TrackerTravelPathDocument, required: true })
    path: TrackerTravelPathDocument;

    @Prop({ type: [AllowedAreaDocument], required: false })
    allowedAreas?: AllowedAreaDocument[];

    @Prop({ type: String, required: false })
    tripNumber?: string;

    @Prop({ type: Number, required: false })
    duration?: number;

    @Prop({ type: String, required: false })
    driverName?: string;

    @Prop({ type: Number, enum: TripCreationService, default: TripCreationService.TrackingControl })
    tripType: TripCreationService;

    @Prop({ type: Date })
    startTrip: Date;

    @Prop({ type: Date, required: false, nullable: true })
    endTrip?: Date;
}

export const TrackerTravelSchema = SchemaFactory.createForClass(TrackerTravelDocument);

// Indexing for optimized querying
TrackerTravelSchema.index({ path: '2dsphere' });
TrackerTravelSchema.index({ terminalNumber: 1, activeStatus: 1 }, { name: 'terminalNumber_activeStatus_index' });
