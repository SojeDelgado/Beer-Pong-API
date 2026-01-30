import { Expose, Transform } from "class-transformer";

export class TournamentIdDto {
    @Expose()
    @Transform(({ obj }) => obj._id.toString())
    id: string;
}