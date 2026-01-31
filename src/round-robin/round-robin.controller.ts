import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { RoundRobinService } from './round-robin.service';
import { UpdateRoundRobinDto } from './dto/update-round-robin.dto';
import { Serialize } from 'src/interceptors/serialize.interceptors';
import { TournamentDto } from 'src/common/dtos/tournament.dto';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { UpdateMatchDto } from 'src/single-elimination/dto/update-match.dto';
import { CreateTournamentDto } from 'src/common/dtos/create-tournament.dto';

@Controller('round-robin')
export class RoundRobinController {
  constructor(private readonly roundRobinService: RoundRobinService) { }

  @Post()
  create(@Body() createRoundRobinDto: CreateTournamentDto) {
    return this.roundRobinService.create(createRoundRobinDto);
  }

  // Traer a todos los torneos, sin los matches.
  @Serialize(TournamentDto)
  @Get()
  findAll() {
    return this.roundRobinService.findAll();
  }

  @Serialize(TournamentDto)
  @Get(':id')
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query('fields') fields?: string
  ) {
    const projection = fields?.split(',').join(' ');
    return this.roundRobinService.findOne(id, projection);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoundRobinDto: UpdateRoundRobinDto) {
    return this.roundRobinService.update(+id, updateRoundRobinDto);
  }

  // @Serialize(SingleEliminationMatchDto)
  @Get(':id/rrMatches')
  getRoundRobinMatches(@Param('id', ParseObjectIdPipe) id: string) {
    return this.roundRobinService.getRoundRobinMatches(id);
  }

  // Actualizar SOLO un Match.
  @Patch(':id/rrMatches/:matchId')
  updateRoundRobinMatch(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('matchId', ParseIntPipe) matchId: number,
    @Body() body: UpdateMatchDto
  ) {
    return this.roundRobinService.updateRoundRobinMatch(id, matchId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roundRobinService.remove(+id);
  }
}
