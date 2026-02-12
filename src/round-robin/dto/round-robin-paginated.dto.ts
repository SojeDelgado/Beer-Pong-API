import { Expose, Type } from "class-transformer"
import { TournamentDto } from "src/common/dtos/tournament.dto"

export class RoundRobinPaginatedDto {
    @Expose()
    @Type(() => TournamentDto)
    data: TournamentDto[]

    @Expose()
    meta: {total: number, page: number, lastPage: number}
}