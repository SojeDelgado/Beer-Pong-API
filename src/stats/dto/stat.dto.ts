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
    torneos_jugados: number;

    @Expose()
    torneos_ganados: number;

    @Expose()
    torneos_perdidos: number;

    @Expose()
    islas: number;

    @Expose()
    s2in1: number;

    @Expose()
    s3in1: number;
}