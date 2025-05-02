import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/common';

@Schema({ versionKey: false, collection: 'Settings' })
export class ApplicationSettingDocument extends AbstractDocument {

    @Prop({ type: Number, required: true })
    maxTimeBetweenTripInMinutes: number; // Max time between trips in minutes

    @Prop({ type: Number, required: true })
    maxDistanceBetweenPositionsInMeters: number; // Max distance between positions in meters

    @Prop({ type: Number, required: true })
    minTimeToDetectConnectedTracker: number; // Min time to detect connected tracker in minutes

    @Prop({ type: Number, required: true })
    maxOverspeedDurationSeconds: number; // Max duration for overspeed in seconds

    @Prop({ type: Number, required: true })
    minAllowedSpeedKmPerHour: number; // Min allowed speed in km/h

    @Prop({ type: Number, required: true })
    dailyRentalFee: number; // Daily rental fee in currency units

    @Prop({ type: Number, required: true })
    minTimeToAcceptTrackingActivityInMinutes: number; // Min time to accept tracking activity in minutes

    @Prop({ type: Number, required: true, min: 0, max: 23 })
    dayStartHour: number; // Start hour of the day (0–23)

    @Prop({ type: Number, required: true, min: 0, max: 23 })
    dayEndHour: number; // End hour of the day (0–23)

    @Prop({ type: Number, required: true })
    maxOverstayingDurationDayInMinutes: number; // Max overstaying duration during the day in minutes

    @Prop({ type: Number, required: true })
    maxOverstayingDurationNightInMinutes: number; // Max overstaying duration during the night in minutes

    @Prop({ type: Number, required: true })
    allowedStopTimeInStopForbiddenAreaInMinutes: number; // Max stop time in forbidden areas in minutes

    @Prop({ type: Number, required: true })
    faultDataMaxAllowedSpeedKmPerHour: number; // Maximum allowed speed (in km/h)

    @Prop({ type: Number, required: true })
    faultDataMinPointDistanceKm: number; // Minimum distance between points (in km)

    @Prop({ type: Number, required: true })
    missingDataDetectionTimeMinutes: number; // Minimum time to detect missing data (in minutes)
}

export const ApplicationSettingSchema =
    SchemaFactory.createForClass(ApplicationSettingDocument);
