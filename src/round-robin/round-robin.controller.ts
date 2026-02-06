import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { RoundRobinService } from './round-robin.service';
import { UpdateRoundRobinDto } from './dto/update-round-robin.dto';
import { Serialize } from 'src/interceptors/serialize.interceptors';
import { TournamentDto } from 'src/common/dtos/tournament.dto';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { UpdateMatchDto } from 'src/single-elimination/dto/update-match.dto';
import { CreateTournamentDto } from 'src/common/dtos/create-tournament.dto';
import { RrMatchDto } from './dto/round-robin-match.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PromotePlayersDto } from './dto/promote-players.dto';
import { SingleEliminationMatchDto } from 'src/common/dtos/single-elimination-match.dto';
import { UpdateSingleEliminationDto } from 'src/single-elimination/dto/update-single-elimination.dto';

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
  findAll(
    @Query() paginationDto: PaginationDto
  ) {
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

  // Actualizar torneos sin los matches
  @Serialize(TournamentDto)
  @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() body: UpdateRoundRobinDto) {
    return this.roundRobinService.update(id, body);
  }

  @Serialize(RrMatchDto)
  @Get(':id/rrMatches')
  getRoundRobinMatches(@Param('id', ParseObjectIdPipe) id: string) {
    console.log("Una request a ROUND ROBIN MATCHES")
    return this.roundRobinService.getRoundRobinMatches(id);
  }

  @Serialize(SingleEliminationMatchDto)
  @Get(':id/seMatches')
  getSingleEliminationMatches(@Param('id', ParseObjectIdPipe) id: string) {
    console.log("Una request a ROUND ROBIN seMATCHES")

    return this.roundRobinService.getSingleEliminationMatches(id);
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

  // Actualizar SOLO un Match de Single Elimination.
  @Patch(':id/seMatches/:matchId')
  updateSingleMatch(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('matchId', ParseIntPipe) matchId: number,
    @Body() body: UpdateMatchDto
  ) {
    return this.roundRobinService.updateSingleEliminationMatch(id, matchId, body);
  }

  // Promover a los mejores x jugadores
  @Post(':id/actions/promote-to-elimination')
  promoteToElimination(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() promotePlayers: PromotePlayersDto
  ) {
    return this.roundRobinService.promotePlayers(id, promotePlayers.players_count)
  }

  @Post(':id/finish-tournament')
  finishTournament(
    @Param('id', ParseObjectIdPipe) id: string
  ) {
    return this.roundRobinService.finishTournament(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roundRobinService.remove(+id);
  }
}
