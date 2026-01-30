import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePlayerDto } from './dtos/create-player.dto';
import { PlayersService } from './players.service';
import { Serialize } from 'src/interceptors/serialize.interceptors';
import { PlayerDto } from './dtos/player.dto';

@Controller('players')
@Serialize(PlayerDto)
export class PlayersController {

    constructor(private playersService: PlayersService) {}

    @Get()
    allPlayers() {
        return this.playersService.findAll();
    }

    @Post()
    createPlayer(@Body() body: CreatePlayerDto) {
        return this.playersService.create(body);
    }

    @Get('/:id')
    getPlayer(@Param('id') id: string) {
        return this.playersService.findById(id);
    }

}
