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

@Injectable()
export class RoundRobinService {

  constructor(
    @InjectModel(RoundRobin.name) private rrModel: Model<RoundRobin>,
    private readonly playersService: PlayersService,
    private readonly matchupBuilder: MatchupsBuilder
  ) { }

  async create(dto: CreateRoundRobinDto) {

    const { playerIds, ...data } = dto;

    const players = await this.playersService.findManyByIds(playerIds);
    if (players.length != playerIds.length) {
      throw new NotFoundException('Uno o mas jugadores no ha sido encontrado')
    }

    const rrMatches = this.matchupBuilder.generateRoundRobinMatchups(players);
    const roundRobin = new this.rrModel({
      name: data.name,
      place: data.place,
      rrMatches: rrMatches,
      seMatches: [] // vacio ya que aun no se saben los resultados.
    })

    return roundRobin.save();
  }

  findAll() {
    return this.rrModel.find()
      .populate('winner', 'nickname')
      .exec();
  }

  findOne(id: string, fields?: string) {
    if (fields?.includes("winner")) {
      return this.rrModel.findById(id, fields).populate('winner', 'nickname').exec();
    } else {
      return this.rrModel.findById(id, fields).exec();
    }
  }

  update(id: number, updateRoundRobinDto: UpdateRoundRobinDto) {
    return `This action updates a #${id} roundRobin`;
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
      throw new NotFoundException(`Torneo con ID ${id} no encontrado`);
    }

    return singleElimination.rrMatches;
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
      ).orFail(new NotFoundException('Torneo o partido no encontrado'));

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
      throw new BadRequestException('Error al intentar actualizar el partido');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} roundRobin`;
  }
}
