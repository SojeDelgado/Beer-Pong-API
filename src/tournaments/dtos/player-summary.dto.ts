import { Expose, Transform } from 'class-transformer';

export class PlayerSummaryDto {
  
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  nickname: string;
}
