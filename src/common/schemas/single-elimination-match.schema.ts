import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Player } from 'src/players/schemas/player.schema';

@Schema({ _id: true })
export class SingleEliminationMatch {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Player.name, default: null })
  home: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: () => Player.name, default: null })
  away: string;

  @Prop({ required: true })
  matchId: number;

  @Prop({ default: null })
  nextMatchId: number;

  @Prop({ required: true })
  round: number;

  @Prop({ default: 0 })
  homeScore: number;

  @Prop({ default: 0 })
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
}

export const MatchSchema = SchemaFactory.createForClass(SingleEliminationMatch);