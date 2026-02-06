import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSingleEliminationDto } from './dto/create-single-elimination.dto';
import { UpdateSingleEliminationDto } from './dto/update-single-elimination.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SingleElimination } from './schemas/single-elimination.schema';
import { Model } from 'mongoose';
import { PlayersService } from 'src/players/players.service';
import { MatchupsBuilder } from 'src/common/logic/genereate-single-elimination-matches';
import { UpdateMatchDto } from './dto/update-match.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DateEnum } from 'src/common/enums/date.enum';
import { StatsService } from 'src/stats/stats.service';
import { SingleEliminationStatus } from './enum/single-elimination-status.enum';

@Injectable()
export class SingleEliminationService {
  constructor(
    @InjectModel(SingleElimination.name)
    private seModel: Model<SingleElimination>,
    private readonly playersService: PlayersService,
    private readonly statsService: StatsService,

    private readonly matchupBuilder: MatchupsBuilder
  ) { }

  async create(dto: CreateSingleEliminationDto) {
    const { playerIds, ...data } = dto;

    const players = await this.playersService.findManyByIds(playerIds);
    if (players.length != playerIds.length) {
      throw new NotFoundException('Uno o mas jugadores no ha sido encontrado')
    }

    const matches = this.matchupBuilder.generateSingleEliminationMatchups(players);
    const singleElimination = new this.seModel({
      name: data.name,
      place: data.place,
      matches: matches
    })

    return singleElimination.save();
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, dateFilter } = paginationDto;
    const totalPages = await this.seModel.countDocuments().exec()
    const lastPage = Math.ceil(totalPages / limit!)
    let date;
    if (dateFilter === DateEnum.RECIENTES) {
      date = -1;
    } else {
      date = 1;
    }
    return {
      data: await this.seModel.find()
        .populate('winner', 'nickname')
        .skip((page! - 1) * limit!)
        .limit(limit!)
        .sort({ createdAt: date })
        .exec(),

      meta: {
        total: totalPages,
        page: page,
        lastPage: lastPage
      }

    }
  }

  async findOne(id: string, fields?: string) {
    if (fields?.includes("winner")) {
      return this.seModel.findById(id, fields).populate('winner', 'nickname').exec();
    } else {
      return this.seModel.findById(id, fields).exec();
    }
  }

  update(id: string, updateSingleEliminationDto: UpdateSingleEliminationDto) {
    try {
      return this.seModel.findByIdAndUpdate(
        id,
        updateSingleEliminationDto,
        {
          new: true
        }
      )
    } catch (err) {
      if (err.name === 'CastError') {
        throw new BadRequestException(`ID "${id}" no es válido`);
      }
      throw err;
    }
  }

  // Obtener unicamente los matches de un torneo
  async getMatches(id: string) {
    const singleElimination = await this.seModel.findById(id)
      .populate({
        path: 'matches.home',
        select: 'nickname'
      })
      .populate({
        path: 'matches.away',
        select: 'nickname'
      });

    if (!singleElimination) {
      throw new NotFoundException(`Torneo con ID ${id} no encontrado`);
    }

    return singleElimination.matches
  }

  // Actualizar SOLO un Match.
  async updateSingleMatch(id: string, matchId: number, dto: UpdateMatchDto) {

    // Validar id's
    const tournament = await this.seModel.findById(id);
    if (!tournament) throw new NotFoundException('Torneo no encontrado');
    const currentMatch = tournament.matches.find(m => m.matchId === matchId);
    if (!currentMatch) throw new NotFoundException('Partido no encontrado');

    const updateFields = {};
    const filters: any = [{ "current.matchId": matchId }];

    const fields = ['homeScore', 'awayScore', 'homeIsla', 'awayIsla', 'home2in1', 'away2in1', 'home3in1', 'away3in1'];
    fields.forEach(field => {
      if (dto[field] !== undefined) {
        updateFields[`matches.$[current].${field}`] = dto[field];
      }
    });


    if (dto.homeScore !== undefined || dto.awayScore !== undefined) {
      const hScore = dto.homeScore ?? currentMatch.homeScore;
      const aScore = dto.awayScore ?? currentMatch.awayScore;

      if (currentMatch.nextMatchId !== null) {
        const winnerId = hScore > aScore ? currentMatch.home : currentMatch.away;

        // Se determina si entra como home o away en el siguiente partido
        const slot = matchId % 2 === 0 ? 'away' : 'home';

        updateFields[`matches.$[next].${slot}`] = winnerId;
        filters.push({ "next.matchId": currentMatch.nextMatchId });
      } else {
        // Es la final (no hay nextMatchId)
        updateFields['status'] = 'Completado';
      }
    }

    try {
      const updatedTournament = await this.seModel.findOneAndUpdate(
        { _id: id },
        { $set: updateFields },
        { arrayFilters: filters, new: true }
      );

      return { message: "Partido actualizado correctamente", updatedTournament };
    } catch (error) {
      throw new BadRequestException('Error al actualizar la base de datos');
    }
  }

  async finishTournament(id: string) {
    const tournament = await this.seModel.findById(id)
    if (!tournament) throw new NotFoundException(`ID de torneo: "${id}" no es válido`);

    if (tournament.status === SingleEliminationStatus.FINALIZADO) {
      throw new BadRequestException('El torneo ya está finalizado');
    }

    try {
      // 1. Actualizar torneo
      tournament.status = SingleEliminationStatus.FINALIZADO;
      tournament.finishedAt = new Date();
      tournament.winner = tournament.matches[0].homeScore > tournament.matches[0].awayScore ? tournament.matches[0].home! : tournament.matches[0].away!
      const validMatches = tournament.matches
        .filter(m => m.home && m.away) // Solo partidos con ambos jugadores
        .map(match => ({
          home: match.home!,
          away: match.away!,
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          homeIsla: match.homeIsla,
          awayIsla: match.awayIsla,
          home2in1: match.home2in1,
          away2in1: match.away2in1,
          home3in1: match.home3in1,
          away3in1: match.away3in1,
        }));

      await tournament.save();

      await this.statsService.createOrUpdateMany(
        {
          matches: validMatches,
          tournamentWinner: tournament.winner
        },
      );

      return {
        success: true,
        data: tournament,
        message: 'Torneo finalizado y estadísticas actualizadas'
      };

    } catch (error) {
      throw error;
    }

  }

  remove(id: number) {
    return `This action removes a #${id} singleElimination`;
  }

}
