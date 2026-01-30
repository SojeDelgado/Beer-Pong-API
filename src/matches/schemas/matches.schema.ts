import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Player } from "src/players/schemas/player.schema";

export type MatchDocument = HydratedDocument<Match>;

@Schema()
export class Match {
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Player.name, default: null })
    home: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Player.name, default: null })
    away: string;

    @Prop({ required: true, default: 0, min: 0, max: 10 })
    homeScore: number;

    @Prop({ required: true, default: 0, min: 0, max: 10 })
    awayScore: number;

    @Prop({ default: false })
    homeIsla: boolean;

    @Prop({ default: false })
    awayIsla: boolean;

    @Prop({ default: false })
    home2in1: boolean;

    @Prop({ default: false })
    away2in1: boolean;

    @Prop({ default: false })
    home3in1: boolean;

    @Prop({ default: false })
    away3in1: boolean;

    @Prop({ default: Date.now })
    date: Date;

    // Campos para eliminacion directa
    @Prop({ required: false, default: 0 })
    matchId: number;

    @Prop({ required: false, default: 0 })
    nextMatchId: number;

    @Prop({ required: false, default: 0 })
    round: number;

}

export const MatchSchema = SchemaFactory.createForClass(Match);