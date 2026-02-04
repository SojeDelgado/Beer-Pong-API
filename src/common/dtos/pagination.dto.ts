import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsPositive } from 'class-validator';
import { DateEnum } from '../enums/date.enum';

export class PaginationDto {
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;

  @IsEnum(DateEnum, {
    message: 
    `Valores validos: ${DateEnum.ANTIGUOS} | ${DateEnum.RECIENTES}`
  })
  @IsOptional()
  dateFilter: DateEnum

}
