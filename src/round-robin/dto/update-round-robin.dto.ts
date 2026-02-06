import { Type } from "class-transformer";
import { IsString, IsOptional, IsEnum, IsMongoId, IsDate, IsNumber } from "class-validator";
import { RoundRobinStatus } from "../enum/round-robin-status.enum";

export class UpdateRoundRobinDto {
    @IsString()
    @IsOptional()
    name: string

    @IsString()
    @IsOptional()
    place: string

    @IsString()
    @IsOptional()
    @IsEnum(RoundRobinStatus, {
        message:
            `status validos: ${RoundRobinStatus.PENDIENTE} | ${RoundRobinStatus.CLASIFICACION_COMPLETADA} | ${RoundRobinStatus.ELIMINACION_DIRECTA} | ${RoundRobinStatus.COMPLETADO} | ${RoundRobinStatus.FINALIZADO}`
    })
    status: RoundRobinStatus

    @IsMongoId()
    @IsString()
    @IsOptional()
    winner: string

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    finishedAt: Date;
}
