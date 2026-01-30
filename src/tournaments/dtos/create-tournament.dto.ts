import { ArrayMinSize, IsArray, IsEnum, IsString, ValidateNested } from "class-validator";
import { TournamentTypesEnum } from "../enums/tournament-types.enum";



export class CreateTournamentDto {
    @IsString()
    name: string;

    @IsString()
    place: string;

    @IsEnum(TournamentTypesEnum)
    type: string;

    @IsArray()
    @ArrayMinSize(2)
    playersIds: string[];
}