import { Expose, Transform, Type } from "class-transformer";
import { PlayerDto } from "src/players/dtos/player.dto";

export class MatchDto {
    @Transform(({ obj }) => obj._id.toString())
    id: string;

    @Expose()
    @Type(() => PlayerDto)
    home: string;

    @Expose()
    @Type(() => PlayerDto)
    away: string;

    @Expose()
    homeScore: number;

    @Expose()
    awayScore: number;

    @Expose()
    homeIsla: boolean;

    @Expose()
    awayIsla: boolean;

    @Expose()
    home2in1: boolean;

    @Expose()
    home3in1: boolean;

    @Expose()
    away2in1: boolean;

    @Expose()
    away3in1: boolean;

    @Expose()
    date: Date;
}