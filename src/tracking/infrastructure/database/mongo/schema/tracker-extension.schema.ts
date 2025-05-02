import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/common';
import { TrackingExtensionStatus } from 'src/tracking/domain';

@Schema({ versionKey: false, collection: 'TrackerExtensions' })
export class TrackerExtensionDocument extends AbstractDocument {

    @Prop({ type: String, index: true })
    trackerExtensionId: string;

    @Prop({ type: String })
    imei: string;

    @Prop({ type: String })
    caption: string;

    @Prop({ type: String })
    description: string;

    @Prop({ type: String })
    terminalNumber: string;

    @Prop({ type: Number, required: false, enum: TrackingExtensionStatus, default: TrackingExtensionStatus.Activating })
    status: TrackingExtensionStatus;

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;
}

export const TrackerExtensionSchema =
    SchemaFactory.createForClass(TrackerExtensionDocument);

// Indexing for optimized querying
TrackerExtensionSchema.index({ terminalNumber: 1, trackerExtensionId: 1 });
