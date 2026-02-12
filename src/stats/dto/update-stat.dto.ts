import { IsNumber } from "class-validator";

export class UpdateStatDto{

    @IsNumber()
    puntos_favor_totales: number;

    @IsNumber()
    puntos_contra_totales: number;

    @IsNumber()
    partidas_jugadas: number;

    @IsNumber()
    partidas_ganadas: number;

    @IsNumber()
    partidas_perdidas: number;

    @IsNumber()
    islas: number;

    @IsNumber()
    s2in1: number;

    @IsNumber()
    s3in1: number;
}