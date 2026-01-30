import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Match, MatchSchema } from "src/matches/schemas/matches.schema";
import { Player } from "src/players/schemas/player.schema";

export type TournamentDocument = HydratedDocument<Tournament>;

@Schema()
export class Tournament {

    @Prop()
    name: string;

    @Prop({ required: true })
    place: string;

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Prop({ default: null })
    finishedAt: Date;

    @Prop({ required: true, enum: ['RoundRobin', 'SingleElimination', 'DoubleElimination'] })
    type: string;

    @Prop({ required: true, enum: ['Pendiente', 'Completado', 'Finalizado'], default: 'Pendiente' })
    status: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Player.name, default: null })
    winner: string

    @Prop({ type: [MatchSchema], required: true })
    matches: Match[];
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);