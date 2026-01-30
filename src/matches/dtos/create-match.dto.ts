import { IsBoolean, IsMongoId, IsNumber, IsString } from "class-validator";

export class CreateMatchDto {
    @IsMongoId()
    home: string;

    @IsMongoId()
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
}