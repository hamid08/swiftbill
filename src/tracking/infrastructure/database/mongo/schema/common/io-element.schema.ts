import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ _id: false, versionKey: false })
export class IoElementDocument {
    @Prop({ type: String })
    key: string;

    @Prop({ type: String })
    value: string;
}