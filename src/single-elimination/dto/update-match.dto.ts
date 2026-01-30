import { IsBoolean, IsNumber, Max, Min, NotEquals } from "class-validator"

export class UpdateMatchDto {
    @IsNumber()
    @Min(0)
    @Max(10)
    homeScore: number

    @IsNumber()
    @Min(0)
    @Max(10)
    awayScore: number

    @IsBoolean()
    homeIsla: boolean

    @IsBoolean()
    awayIsla: boolean

    @IsBoolean()
    home2in1: boolean
    @IsBoolean()
    away2in1: boolean
    @IsBoolean()
    home3in1: boolean
    @IsBoolean()
    away3in1: boolean
}