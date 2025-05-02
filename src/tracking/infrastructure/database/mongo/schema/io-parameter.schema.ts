import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/common';

@Schema({ _id: false, versionKey: false })
class IoParameterValueDocument {
    @Prop({ type: String })
    name: string; // The name of the parameter value

    @Prop({ type: String })
    caption: string; // Caption or label for the parameter value

    @Prop({ type: String })
    value: string; // The actual value of the parameter

    @Prop({ type: String, required: false })
    color?: string; // Optional field for color

    @Prop({ type: String, required: false })
    description?: string; // Optional field for description
}

@Schema({ versionKey: false, collection: 'IoParameters' })
export class IoParameterDocument extends AbstractDocument {
    @Prop({ type: String, index: true })
    ioParameterId: string;

    @Prop({ type: String })
    modelId: string;

    @Prop({ type: String })
    caption: string;

    @Prop({ type: String })
    name: string;

    @Prop({ type: String, index: true })
    key: string;

    @Prop({ type: String })
    unit: string;

    @Prop({ type: String })
    icon: string;

    @Prop({ type: Boolean, default: false })
    isEvent: boolean;

    @Prop({ type: Boolean, default: false })
    showInPanel: boolean; // Indicates whether this parameter is shown in the panel

    @Prop({ type: [IoParameterValueDocument] })
    valueTypes?: IoParameterValueDocument[];
}

export const IoParameterSchema =
    SchemaFactory.createForClass(IoParameterDocument);

// Indexes for fast querying
IoParameterSchema.index({ modelId: 1, key: 1 });
