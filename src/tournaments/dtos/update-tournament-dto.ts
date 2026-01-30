import { Prop } from "@nestjs/mongoose";
import { IsDate, IsEnum, IsMongoId, IsOptional, IsString } from "class-validator";
import { TournamentStatus } from "../enums/status.enum";

export class UpdateTournamentDto {
    @Prop()
    @IsOptional()
    @IsString()
    name: string;

    @Prop()
    @IsOptional()
    @IsString()
    place: string;

    @Prop()
    @IsOptional()
    @IsDate()
    createdAt: Date;

    @Prop()
    @IsOptional()
    @IsDate()
    finishedAt: Date;

    @Prop()
    @IsOptional()
    @IsEnum(TournamentStatus, {
        message: `Valid status are ${TournamentStatus}`
    })
    status: TournamentStatus;

    @Prop()
    @IsOptional()
    @IsMongoId()
    winner: string;
}