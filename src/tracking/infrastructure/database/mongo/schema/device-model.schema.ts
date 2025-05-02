import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/common';
import { TrackingModelCommand } from 'src/tracking/domain';

@Schema({ versionKey: false, collection: 'TrackerModels' })
export class DeviceModelDocument extends AbstractDocument {

    @Prop({ type: String, index: true, unique: true })
    modelId: string;

    @Prop({ type: String })
    caption: string;

    @Prop({ type: String, index: true })
    brandId: string; // Brand identifier associated with the device model

    @Prop({ type: [Number], enum: TrackingModelCommand, required: false })
    deviceCommands?: TrackingModelCommand[]; // Commands supported by the device model (optional)

    @Prop({ type: Boolean, default: false })
    isMobile: boolean; // Whether the device model is mobile (default is false)

    @Prop({ type: Boolean, default: false })
    hasTrackerExtension: boolean; // Whether the device model has tracker extension (default is false)
}

export const DeviceModelSchema =
    SchemaFactory.createForClass(DeviceModelDocument);
