import { Type } from "class-transformer";
import { IsArray, IsMongoId, IsOptional } from "class-validator";
import { CreateMatchDto } from "src/matches/dto/create-match.dto";

export class UpdateManyStatsByMatchesDto {
    @IsArray()
    @Type(() => CreateMatchDto)
    matches: CreateMatchDto[]

    @IsOptional()
    @IsMongoId()
    tournamentWinner?: string;
}