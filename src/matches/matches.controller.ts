import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Serialize } from 'src/interceptors/serialize.interceptors';
import { MatchPaginatedDto } from './dto/match.paginated.dto';
import { MatchDto } from './dto/match.dto';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) { }

  @Serialize(MatchDto)
  @Post()
  create(@Body() createMatchDto: CreateMatchDto) {
    return this.matchesService.create(createMatchDto);
  }

  @Get()
  @Serialize(MatchPaginatedDto)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.matchesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.matchesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMatchDto: UpdateMatchDto) {
    return this.matchesService.update(+id, updateMatchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.matchesService.remove(+id);
  }
}
