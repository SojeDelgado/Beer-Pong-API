import { IsString } from "class-validator";

export class CreatePlayerDto {
    @IsString()
    nickname: string;
}