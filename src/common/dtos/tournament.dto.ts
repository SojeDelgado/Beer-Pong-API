import { Expose, Transform, Type } from "class-transformer";
import { PlayerDto } from "src/players/dtos/player.dto";

export class TournamentDto {
    @Expose()
    @Transform(({ obj }) => obj._id.toString())
    id?: string;

    @Expose()
    name?: string;

    @Expose()
    place?: string;

    @Expose()
    status?: string

    @Expose()
    @Type(() => PlayerDto)
    winner?: string

    @Expose()
    createdAt?: Date

    @Expose()
    finishedAt?: Date
}