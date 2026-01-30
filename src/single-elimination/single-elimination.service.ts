import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSingleEliminationDto } from './dto/create-single-elimination.dto';
import { UpdateSingleEliminationDto } from './dto/update-single-elimination.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SingleElimination } from './schemas/single-elimination.schema';
import { Model } from 'mongoose';
import { PlayersService } from 'src/players/players.service';
import { MatchupsBuilder } from 'src/common/logic/genereate-single-elimination-matches';
import { UpdateMatchDto } from './dto/update-match.dto';

@Injectable()
export class SingleEliminationService {
  constructor(
    @InjectModel(SingleElimination.name)
    private seModel: Model<SingleElimination>,
    private readonly playersService: PlayersService,
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

  findAll() {
    return this.seModel.find()
      .populate('winner', 'nickname')
      .exec();
  }

  async findOne(id: string, fields?: string) {
    if (fields?.includes("winner")) {
      return this.seModel.findById(id, fields).populate('winner', 'nickname').exec();
    } else{
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

  remove(id: number) {
    return `This action removes a #${id} singleElimination`;
  }

}
