import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from 'src/common';

@Schema({ versionKey: false, collection: 'TrackerBrands' })
export class BrandDocument extends AbstractDocument {

    @Prop({ type: String, index: true, unique: true })
    brandId: string;

    @Prop({ type: String })
    caption: string;

    @Prop({ type: String })
    name: string;

    @Prop({ type: Boolean, required: true })
    isMobile: boolean; // Whether the brand is associated with mobile devices
}

export const BrandSchema =
    SchemaFactory.createForClass(BrandDocument);
