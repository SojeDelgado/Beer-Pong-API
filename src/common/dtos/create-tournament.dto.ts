import { ArrayMinSize, IsArray, IsMongoId, IsString } from "class-validator";


export class CreateTournamentDto {
    @IsString()
    name: string;

    @IsString()
    place: string;

    @IsArray()
    @ArrayMinSize(2, { message: 'El torneo requiere al menos 2 jugadores' })
    @IsMongoId({ each: true, message: 'Cada ID de jugador debe ser un MongoID válido' })
    playerIds: string[];
}