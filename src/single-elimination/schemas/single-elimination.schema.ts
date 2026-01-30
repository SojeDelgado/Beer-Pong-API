import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { SingleEliminationStatus } from '../enum/single-elimination-status.enum';
import { SingleEliminationMatch } from 'src/common/schemas/single-elimination-match.schema';

export type SingleEliminationDocument = HydratedDocument<SingleElimination>;

@Schema()
export class SingleElimination {
    @Prop({ required: true, default: '' })
    name: string

    @Prop({ required: true, default: '' })
    place: string

    @Prop({ required: true, enum: SingleEliminationStatus, default: 'Pendiente' })
    status: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Player', default: null })
    winner: string

    @Prop({ required: true, default: Date.now })
    createdAt: Date;

    @Prop({ default: null })
    finishedAt: Date;

    @Prop({ type: [SingleEliminationMatch], default: [] })
    matches: SingleEliminationMatch[];
}

export const SingleEliminationSchema = SchemaFactory.createForClass(SingleElimination);