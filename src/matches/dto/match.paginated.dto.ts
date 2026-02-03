import { Expose, Type } from "class-transformer";
import { MatchDto } from "./match.dto";
import { Match } from "../schemas/matches.schema";

export class MatchPaginatedDto {
    @Expose()
    @Type(() => MatchDto)
    data: Match[]

    @Expose()
    meta: {total: number, page: number, lastPage: number}
}