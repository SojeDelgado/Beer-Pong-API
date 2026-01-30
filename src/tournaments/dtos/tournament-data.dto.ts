import { Expose, Transform } from "class-transformer";

export class TournamentDataDto {
    @Expose()
    @Transform(({ obj }) => obj._id.toString())
    id: string;

    @Expose()
    name: string;

    @Expose()
    place: string;

    @Expose()
    type: string;

    @Expose()
    status: string

    @Expose()
    createdAt: Date

    @Expose()
    finishedAt: Date

    @Expose()
    winner: string
}