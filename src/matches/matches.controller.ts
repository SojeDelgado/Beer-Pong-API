import { Body, Controller, Get, Post } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { Serialize } from 'src/interceptors/serialize.interceptors';
import { MatchDto } from './dtos/match.dto';
import { CreateMatchDto } from './dtos/create-match.dto';

@Controller('matches')
@Serialize(MatchDto)
export class MatchesController {

    constructor(private matchesService: MatchesService){}

    @Get()
    allMatches() {
        return this.matchesService.findAll();
    }

    @Post()
    createMatch(@Body() body: CreateMatchDto) {
        return this.matchesService.create(body);
    }

}
