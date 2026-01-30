import { Expose, Transform, Type } from "class-transformer";
import { PlayerDto } from "src/players/dtos/player.dto";

export class StatDto {
    @Transform(({ obj }) => obj._id.toString())
    id: string;

    @Expose()
    @Type(() => PlayerDto)
    player: string;

    @Expose()
    puntos_favor_totales: number;

    @Expose()
    puntos_contra_totales: number;

    @Expose()
    partidas_jugadas: number;

    @Expose()
    partidas_ganadas: number;

    @Expose()
    partidas_perdidas: number;

    @Expose()
    islas: number;
}