import { ArrayMinSize, IsArray, IsMongoId, IsNumber, IsString, Min } from "class-validator";

export class CreateRoundRobinDto {
    @IsString()
    name: string;

    @IsString()
    place: string;

    @IsArray()
    @ArrayMinSize(2, { message: 'El torneo requiere al menos 2 jugadores' })
    @IsMongoId({ each: true, message: 'Cada ID de jugador debe ser un MongoID válido' })
    playerIds: string[];
}
