import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query } from '@nestjs/common';
import { SingleEliminationService } from './single-elimination.service';
import { UpdateSingleEliminationDto } from './dto/update-single-elimination.dto';
import { Serialize } from 'src/interceptors/serialize.interceptors';
import { TournamentDto } from 'src/common/dtos/tournament.dto';
import { ParseObjectIdPipe } from 'nestjs-object-id';
import { UpdateMatchDto } from './dto/update-match.dto';
import { SingleEliminationMatchDto } from 'src/common/dtos/single-elimination-match.dto';
import { CreateTournamentDto } from 'src/common/dtos/create-tournament.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { SingleEliminationPaginatedDto } from './dto/se-paginated-dto';

@Controller('single-elimination')
export class SingleEliminationController {
  constructor(private readonly singleEliminationService: SingleEliminationService) { }

  @Post()
  create(@Body() createSingleEliminationDto: CreateTournamentDto) {
    return this.singleEliminationService.create(createSingleEliminationDto);
  }

  // Traer a todos los torneos sin los matches, para no hacer una sobrecarga.
  @Get()
  @Serialize(SingleEliminationPaginatedDto)
  findAll(@Query() paginationDto: PaginationDto ) {
    return this.singleEliminationService.findAll(paginationDto);
  }

  // Traer al torneo sin los matches
  @Serialize(TournamentDto)
  @Get(':id')
  findOne(
    @Param('id', ParseObjectIdPipe) id: string,
    @Query('fields') fields?: string
  ) {
    const projection = fields?.split(',').join(' ');
    return this.singleEliminationService.findOne(id, projection);
  }

  // Actualizar torneos sin los matches
  @Serialize(TournamentDto)
  @Patch(':id')
  update(@Param('id', ParseObjectIdPipe) id: string, @Body() updateSingleEliminationDto: UpdateSingleEliminationDto) {
    return this.singleEliminationService.update(id, updateSingleEliminationDto);
  }

  // Obtener unicamente los matches de un torneo
  @Serialize(SingleEliminationMatchDto)
  @Get(':id/matches')
  getMatches(@Param('id', ParseObjectIdPipe) id: string) {
    console.log("Una request a SINGLE ELIMINATION MATCHES")
    return this.singleEliminationService.getMatches(id);
  }


  // Actualizar SOLO un Match.
  @Patch(':id/matches/:matchId')
  updateSingleMatch(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('matchId', ParseIntPipe) matchId: number,
    @Body() body: UpdateMatchDto
  ) {
    return this.singleEliminationService.updateSingleMatch(id, matchId, body);
  }

  @Post(':id/finish-tournament')
  finishTournament(
    @Param('id', ParseObjectIdPipe) id: string
  ) {
    return this.singleEliminationService.finishTournament(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.singleEliminationService.remove(+id);
  }
}
