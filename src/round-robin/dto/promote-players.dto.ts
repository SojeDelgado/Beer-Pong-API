import { Type } from "class-transformer";
import { IsNumber, IsPositive, Min } from "class-validator";

export class PromotePlayersDto {
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    @Min(2)
    players_count: number
}