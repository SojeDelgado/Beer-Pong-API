import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Player } from "src/players/schemas/player.schema";

export type StatDocument = HydratedDocument<Stat>;

@Schema()
export class Stat {

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Player.name, required: true })
    player: string;

    @Prop({ default: 0, min: 0 })
    puntos_favor_totales: number;

    @Prop({ default: 0, min: 0 })
    puntos_contra_totales: number;

    @Prop({ default: 0, min: 0 })
    partidas_jugadas: number;

    @Prop({ default: 0, min: 0 })
    partidas_ganadas: number;

    @Prop({ default: 0, min: 0 })
    partidas_perdidas: number;

    @Prop({ default: 0, min: 0 })
    islas: number;

}

export const StatSchema = SchemaFactory.createForClass(Stat);