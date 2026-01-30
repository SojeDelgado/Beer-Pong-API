import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TournamentsService } from './tournaments.service';
import { Serialize } from 'src/interceptors/serialize.interceptors';
import { CreateTournamentDto } from './dtos/create-tournament.dto';
import { TournamentTypesEnum } from './enums/tournament-types.enum';
import { TournamentDataDto } from './dtos/tournament-data.dto';
import { UpdateMatchesTournamentDto } from './dtos/update-matches-tournament-match.dto';
import { SingleEliminationMatchDto } from 'src/common/dtos/single-elimination-match.dto';
import { UpdateTournamentDto } from './dtos/update-tournament-dto';

@Controller('tournaments')
export class TournamentsController {

    constructor(private readonly tournamentsService: TournamentsService) { }

    @Serialize(TournamentDataDto) // Sin los partidos, para no hacer tantas consultas
    @Get()
    findAll(@Query('type') type: TournamentTypesEnum) {
        return this.tournamentsService.findByType(type);
    }

    @Serialize(SingleEliminationMatchDto)
    @Get('/:id')
    getTournament(@Param('id') id: string) {
        return this.tournamentsService.findMatchesById(id);
    }

    @Post()
    createTournament(@Body() body: CreateTournamentDto) {
        return this.tournamentsService.create(body);
    }

    @Post('update-se-matches')
    updateSingleEliminationMatchResult(@Body() body: UpdateMatchesTournamentDto) {
        return this.tournamentsService.updateSEMatchResult(body);
    }

    @Post('update-match')
    updateRRMatch(@Body() body: UpdateMatchesTournamentDto) {
        return this.tournamentsService.updateRRMatchResult(body);
    }

    @Get('/:id/status')
    getTournamentStatus(@Param('id') id: string) {
        return this.tournamentsService.getTournamentStatus(id);
    }

    // tournament.controller.ts

    @Patch(':id')
    async updateTournament(
        @Param('id') id: string,
        @Body() updateTournamentDto: UpdateTournamentDto // Un DTO que acepte campos opcionales
    ) {
        return await this.tournamentsService.update(id, updateTournamentDto);
    }
}
