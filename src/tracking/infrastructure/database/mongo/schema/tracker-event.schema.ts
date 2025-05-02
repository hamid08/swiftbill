import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/common';
import { TrackingEventLevel } from 'src/tracking/domain';
import { IoElementDocument } from './common';

@Schema({ versionKey: false, collection: 'TrackerEvents' })
export class TrackerEventDocument extends AbstractDocument {

    @Prop({ type: String })
    imei: string;

    @Prop({ type: String, index: true })
    terminalNumber: string;

    @Prop({ type: String, required: false, index: true })
    trackerExtensionId?: string;

    @Prop({ type: Number, enum: TrackingEventLevel, default: TrackingEventLevel.Info })
    level: TrackingEventLevel;

    @Prop({ type: Number, required: false, default: null })
    altitude?: number;

    @Prop({ type: Number, required: false, default: null })
    angle?: number;

    @Prop({ type: Number, required: false, default: null })
    latitude?: number;

    @Prop({ type: Number, required: false, default: null })
    longitude?: number;

    @Prop({ type: Number, required: false, default: null })
    speed?: number;

    @Prop({ type: Date, default: new Date() })
    eventTime: Date;

    @Prop({ type: Boolean, default: false })
    isVisited: boolean;

    @Prop({ type: IoElementDocument })
    ioElement: IoElementDocument;

}

export const TrackerEventSchema =
    SchemaFactory.createForClass(TrackerEventDocument);

// Indexing for performance optimization
TrackerEventSchema.index({ terminalNumber: 1, trackerExtensionId: 1 });
