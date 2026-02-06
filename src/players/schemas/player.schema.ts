import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type PlayerDocument = HydratedDocument<Player>;

@Schema()
export class Player {
    _id: string;
    
    @Prop({ required: true })
    nickname: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);