import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { RoundRobinMatch } from "src/common/schemas/round-robin-match.schema";
import { SingleEliminationMatch } from "src/common/schemas/single-elimination-match.schema";
import { RoundRobinStatus } from "../enum/round-robin-status.enum";

export type RoundRobinDocument = HydratedDocument<RoundRobin>;

@Schema()
export class RoundRobin {
    @Prop({ required: true, default: '' })
    name: string

    @Prop({ required: true, default: '' })
    place: string

    @Prop({ required: true, enum: RoundRobinStatus, default: RoundRobinStatus.PENDIENTE })
    status: string;

    @Prop({ default: 0 })
    totalPlayers: number;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null })
    winner: string

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Prop({ default: null })
    finishedAt: Date;

    @Prop({ type: [RoundRobinMatch], default: [] })
    rrMatches: RoundRobinMatch[];

    @Prop({ type: [SingleEliminationMatch], default: [] })
    seMatches: SingleEliminationMatch[];

}

export const RoundRobinSchema = SchemaFactory.createForClass(RoundRobin);
