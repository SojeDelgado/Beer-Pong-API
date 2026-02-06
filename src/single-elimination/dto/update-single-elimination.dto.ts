import { IsDate, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from "class-validator";
import { SingleEliminationStatus } from "../enum/single-elimination-status.enum";
import { Type } from "class-transformer";

export class UpdateSingleEliminationDto {
    @IsString()
    @IsOptional()
    name: string

    @IsString()
    @IsOptional()
    place: string

    @IsString()
    @IsOptional()
    @IsEnum(SingleEliminationStatus, {
        message:
            `status validos: ${SingleEliminationStatus.PENDIENTE} | ${SingleEliminationStatus.COMPLETADO} | ${SingleEliminationStatus.FINALIZADO}`
    })
    status: SingleEliminationStatus

    @IsMongoId()
    @IsString()
    @IsOptional()
    winner: string

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    finishedAt: Date;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    totalPlayers: number;
}
