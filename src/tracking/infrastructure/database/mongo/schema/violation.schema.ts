import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/common';
import { ViolationType } from 'src/tracking';

@Schema({ _id: false, versionKey: false })
export class ViolationLocationDocument {

    @Prop({ type: Number, required: false })
    altitude?: number;

    @Prop({ type: Number })
    angle: number;

    @Prop({ type: Number })
    latitude: number;

    @Prop({ type: Number })
    longitude: number;

    @Prop({ type: Number })
    speed: number;
}


@Schema({ versionKey: false, collection: 'Violations' })
export class ViolationDocument extends AbstractDocument {

    @Prop({ type: Date })
    registerDate: Date;

    @Prop({ type: Date })
    startDate: Date;

    @Prop({ type: Date, required: false })
    endDate?: Date;

    @Prop({ type: String })
    imei: string;

    @Prop({ type: String })
    terminalNumber: string;

    @Prop({ type: ViolationLocationDocument })
    location: ViolationLocationDocument; // startLocation

    @Prop({ type: ViolationLocationDocument, required: false })
    endLocation?: ViolationLocationDocument;

    @Prop({ type: Number, enum: ViolationType })
    type: ViolationType;
}

export const ViolationSchema = SchemaFactory.createForClass(ViolationDocument);

// Index for efficient querying based on terminal number and violation type
ViolationSchema.index({ terminalNumber: 1, type: 1 });

