import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoundRobinDto } from './dto/create-round-robin.dto';
import { UpdateRoundRobinDto } from './dto/update-round-robin.dto';
import { InjectModel } from '@nestjs/mongoose';
import { RoundRobin } from './schemas/round-robin.schema';
import { Model } from 'mongoose';
import { PlayersService } from 'src/players/players.service';
import { MatchupsBuilder } from 'src/common/logic/genereate-single-elimination-matches';
import { UpdateMatchDto } from 'src/single-elimination/dto/update-match.dto';
import { RoundRobinStatus } from './enum/round-robin-status.enum';
import { SingleEliminationStatus } from 'src/single-elimination/enum/single-elimination-status.enum';

import { StatsService } from 'src/stats/stats.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { DateEnum } from 'src/common/enums/date.enum';


@Injectable()
export class RoundRobinService {

  constructor(
    @InjectModel(RoundRobin.name) private rrModel: Model<RoundRobin>,
    private readonly playersService: PlayersService,
    private readonly statsService: StatsService,
    private readonly matchupBuilder: MatchupsBuilder
  ) { }

  async create(dto: CreateRoundRobinDto) {

    const { playerIds, ...data } = dto;

    const players = await this.playersService.findManyByIds(playerIds);
    if (players.length != playerIds.length) {
      throw new NotFoundException({
        message: 'Uno o mas jugadores no ha sido encontrado'
      })
    }

    const rrMatches = this.matchupBuilder.generateRoundRobinMatchups(players);
    const roundRobin = new this.rrModel({
      name: data.name,
      place: data.place,
      totalPlayers: players.length,
      rrMatches: rrMatches,
      seMatches: [] // vacio ya que aun no se saben los resultados.
    })

    return roundRobin.save();
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, dateFilter } = paginationDto;
    const totalPages = await this.rrModel.countDocuments().exec()
    const lastPage = Math.ceil(totalPages / limit!)
    let date;
    if (dateFilter === DateEnum.RECIENTES) {
      date = -1;
    } else {
      date = 1;
    }
    return {
      data: await this.rrModel.find()
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

  findOne(id: string, fields?: string) {
    if (fields?.includes("winner")) {
      return this.rrModel.findById(id, fields).populate('winner', 'nickname').exec();
    } else {
      return this.rrModel.findById(id, fields).exec();
    }
  }

  update(id: string, updateRoundRobinDto: UpdateRoundRobinDto) {
    try {
      return this.rrModel.findByIdAndUpdate(
        id,
        updateRoundRobinDto,
        {
          new: true
        }
      )
    } catch (err) {
      if (err.name === 'CastError') {
        throw new BadRequestException({
          message: `ID "${id}" no es válido`
        });
      }
      throw err;
    }
  }

  async getRoundRobinMatches(id: string) {
    const singleElimination = await this.rrModel.findById(id)
      .populate({
        path: 'rrMatches.home',
        select: 'nickname'
      })
      .populate({
        path: 'rrMatches.away',
        select: 'nickname'
      });

    if (!singleElimination) {
      throw new NotFoundException({
        message: `Torneo con ID ${id} no encontrado`
      });
    }

    return singleElimination.rrMatches;
  }

  async getSingleEliminationMatches(id: string) {
    const singleElimination = await this.rrModel.findById(id)
      .populate({
        path: 'seMatches.home',
        select: 'nickname'
      })
      .populate({
        path: 'seMatches.away',
        select: 'nickname'
      });

    if (!singleElimination) {
      throw new NotFoundException({
        message: `Torneo con ID ${id} no encontrado`
      });
    }

    return singleElimination.seMatches;
  }

  async updateRoundRobinMatch(id: string, matchId: number, dto: UpdateMatchDto) {
    const updateFields = Object.entries(dto).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[`rrMatches.$[match].${key}`] = value;
      return acc;
    }, {});

    // Forzamos que el partido se marque como finalizado
    updateFields['rrMatches.$[match].isFinished'] = true;

    try {
      const tournament = await this.rrModel.findOneAndUpdate(
        { _id: id },
        { $set: updateFields },
        { arrayFilters: [{ "match.matchId": matchId }], new: true }

      ).orFail(new NotFoundException({
        message: 'Torneo o partido no encontrado'
      }));

      // Validacion de si se han jugado todos los partidos:
      const allFinished = tournament.rrMatches.every(m => m.isFinished);

      if (allFinished && tournament.status === "Pendiente") {
        tournament.status = RoundRobinStatus.CLASIFICACION_COMPLETADA;
        await tournament.save();
      }

      return {
        message: "Partido actualizado",
        status: tournament.status,
        matchId
      };

    } catch (error) {
      throw new BadRequestException({
        message: `Error al intentar actualizar el partido, ${error}`
      });
    }
  }

  async updateSingleEliminationMatch(id: string, matchId: number, dto: UpdateMatchDto) {
    const tournament = await this.rrModel.findById(id);
    if (!tournament) throw new NotFoundException('Torneo no encontrado');
    const currentMatch = tournament.seMatches.find(m => m.matchId === matchId);
    if (!currentMatch) throw new NotFoundException({
      message: 'Partido no encontrado'
    });

    const updateFields = {};
    const filters: any = [{ "current.matchId": matchId }];

    const fields = ['homeScore', 'awayScore', 'homeIsla', 'awayIsla', 'home2in1', 'away2in1', 'home3in1', 'away3in1'];
    fields.forEach(field => {
      if (dto[field] !== undefined) {
        updateFields[`seMatches.$[current].${field}`] = dto[field];
      }
    });

    if (dto.homeScore !== undefined || dto.awayScore !== undefined) {
      const hScore = dto.homeScore ?? currentMatch.homeScore;
      const aScore = dto.awayScore ?? currentMatch.awayScore;

      if (currentMatch.nextMatchId !== null) {
        const winnerId = hScore > aScore ? currentMatch.home : currentMatch.away;

        // Se determina si entra como home o away en el siguiente partido
        const slot = matchId % 2 === 0 ? 'away' : 'home';

        updateFields[`seMatches.$[next].${slot}`] = winnerId;
        filters.push({ "next.matchId": currentMatch.nextMatchId });
      } else {
        // Es la final (no hay nextMatchId)
        updateFields['status'] = 'Completado';
      }
    }

    try {
      const updatedTournament = await this.rrModel.findOneAndUpdate(
        { _id: id },
        { $set: updateFields },
        { arrayFilters: filters, new: true }
      );

      return { message: "Partido actualizado correctamente", updatedTournament };
    } catch (error) {
      throw new BadRequestException({
        message: 'Error al actualizar la base de datos'
      });
    }

  }

  async promotePlayers(id: string, playersCount: number) {
    const tournament = await this.rrModel.findById(id);

    if (!tournament) {
      throw new NotFoundException({
        message: `Torneo con ID: ${id} no encontrado`
      });
    }

    if (playersCount > tournament.totalPlayers) {
      throw new BadRequestException({
        message: `${playersCount} es mayor a la cantidad de participantes: ${tournament.totalPlayers}`
      });
    }

    if (tournament.seMatches.length !== 0) {
      throw new BadRequestException({
        message: `No se pueden promover jugadores. El torneo ya cuenta con partidos de eliminacion directa.`
      });
    }

    const stats = new Map<string, any>();

    tournament.rrMatches.forEach((match) => {
      // Validar cada partido terminado
      if (!match.isFinished) {
        throw new BadRequestException({
          message: `El partido con ID: ${match.matchId} no ha sido jugado`
        });
      };

      [
        { id: match.home, score: match.homeScore, oppScore: match.awayScore },
        { id: match.away, score: match.awayScore, oppScore: match.homeScore }
      ].forEach((player) => {
        const playerId = player.id.toString();

        const stat = stats.get(playerId) || { id: playerId, won: 0, pointsFor: 0, pointsAgainst: 0 };
        // Asignar victorias
        if (player.score > player.oppScore) {
          stat.won += 1;
        }
        // Asignar puntos a favor y contra
        stat.pointsFor += player.score;
        stat.pointsAgainst += player.oppScore;

        // Asignar a STATS la stat y jugador.
        stats.set(playerId, stat)
      });
    });

    // Convertir a array para ordenar:
    const rankedPlayers = Array.from(stats.values()).sort((a, b) => {
      // Criterio 1: Partidos Ganados
      if (b.won !== a.won) return b.won - a.won;

      // Criterio 2: Diferencia de Score
      const diffA = a.pointsFor - a.pointsAgainst;
      const diffB = b.pointsFor - b.pointsAgainst;
      if (diffB !== diffA) return diffB - diffA;

      return 0;
    });

    const promotedIds = rankedPlayers.slice(0, playersCount).map(p => p.id);
    const unorderedPlayers = await this.playersService.findManyByIds(promotedIds);
    const players = unorderedPlayers.sort((a, b) => {
      return promotedIds.indexOf(a._id.toString()) - promotedIds.indexOf(b._id.toString());
    });

    const seMatches = this.matchupBuilder.generateSingleEliminationMatchups(players);


    try {

      tournament.status = RoundRobinStatus.ELIMINACION_DIRECTA;
      tournament.seMatches = seMatches.map(m => ({
        home: m.home?._id ?? null,
        away: m.away?._id ?? null,
        matchId: m.matchId ?? 0,
        nextMatchId: m.nextMatchId ?? null,
        round: m.round,
        homeScore: 0,
        awayScore: 0,
        homeIsla: false,
        awayIsla: false,
        home2in1: false,
        away2in1: false,
        home3in1: false,
        away3in1: false
      }));


      await tournament.save();
      // Actualizar stats despues de guardar:
      const validMatches = tournament.rrMatches
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

      await this.statsService.createOrUpdateMany(
        {
          matches: validMatches
        },
      );

      return promotedIds;
    } catch (err) {
      throw new Error(err);
    }
  }

  async finishTournament(id: string) {
    const tournament = await this.rrModel.findById(id)
    if (!tournament) throw new NotFoundException({
      message: `ID de torneo: "${id}" no es válido`
    });

    if (tournament.status === SingleEliminationStatus.FINALIZADO) {
      throw new BadRequestException({
        message: 'El torneo ya está finalizado'
      });
    }

    try {
      // 1. Actualizar torneo
      tournament.status = SingleEliminationStatus.FINALIZADO;
      tournament.finishedAt = new Date();
      // Ganador del partido final (Single Elimination Matches).
      tournament.winner = tournament.seMatches[0].homeScore > tournament.seMatches[0].awayScore ? tournament.seMatches[0].home! : tournament.seMatches[0].away!
      const validMatches = tournament.seMatches
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
    return `This action removes a #${id} roundRobin`;
  }
}
