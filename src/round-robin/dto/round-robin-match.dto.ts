import { Expose, Type } from "class-transformer";
import { PlayerDto } from "src/players/dtos/player.dto";

export class RrMatchDto {
    @Expose()
    matchId: number

    @Expose()
    @Type(() => PlayerDto)
    home: string

    @Expose()
    @Type(() => PlayerDto)
    away: string

    @Expose()
    round: number

    @Expose()
    homeScore: number
    @Expose()
    awayScore: number

    @Expose()
    homeIsla: boolean
    @Expose()
    awayIsla: boolean

    @Expose()
    home2in1: boolean
    @Expose()
    away2in1: boolean

    @Expose()
    home3in1: boolean
    @Expose()
    away3in1: boolean

    @Expose()
    isFinished: boolean
}