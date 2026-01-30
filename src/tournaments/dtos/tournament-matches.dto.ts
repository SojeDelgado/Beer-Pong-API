import { Expose, Transform, Type } from "class-transformer";
import { MatchDto } from "src/matches/dtos/match.dto";
import { Match } from "src/matches/schemas/matches.schema";

export class TournamentMatchesDto {
    // @Expose()
    // @Transform(({ obj }) => obj._id.toString())
    // id: string;

    @Expose()
    @Type(() => MatchDto)
    matches: Match[]

}