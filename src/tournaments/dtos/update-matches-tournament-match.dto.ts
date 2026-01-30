import { IsBoolean, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";


export class UpdateMatchesTournamentDto {

    @IsMongoId()
    tournamentId: string;

    @IsMongoId()
    @IsOptional()
    home: string;

    @IsMongoId()
    @IsOptional()
    away: string;

    @IsNumber()
    homeScore: number;

    @IsNumber()
    awayScore: number;

    @IsBoolean()
    homeIsla: boolean;

    @IsBoolean()
    awayIsla: boolean;

    @IsBoolean()
    home2in1: boolean;

    @IsBoolean()
    away2in1: boolean;

    @IsBoolean()
    home3in1: boolean;

    @IsBoolean()
    away3in1: boolean;

    @IsNumber()
    matchId: number

    @IsNumber()
    @IsOptional()
    nextMatchId: number
}