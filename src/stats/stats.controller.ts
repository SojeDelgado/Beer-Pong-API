import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StatsService } from './stats.service';
import { UpdateStatDto } from './dto/update-stat.dto';
import { Serialize } from 'src/interceptors/serialize.interceptors';
import { StatDto } from './dto/stat.dto';

@Controller('stats')
@Serialize(StatDto)
export class StatsController {

    constructor(private statsService: StatsService) {}

    @Get()
    allStats(){
        return this.statsService.findAll();
    }

    @Post('/:player')
    updateOrCreate(
        @Param('player') player: string, @Body() body: UpdateStatDto ) {
        return this.statsService.createOrUpdate(player, body);
    }
}
